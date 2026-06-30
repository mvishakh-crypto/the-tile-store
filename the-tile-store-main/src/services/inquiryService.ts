// @ts-nocheck
// ============================================================
// Inquiry Service â€” DB-backed inquiry cart and submission
// Persists to Supabase, validates with Zod, sends via edge function
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId, handleSupabaseError } from '../lib/supabase';
import { inquirySchema, type InquiryFormData } from '../lib/validation';
import type { TileProduct } from '../types';
import type { InquiryItem } from '../components/InquiryCartDrawer';

const CART_STORAGE_KEY = 'atelier-inquiry-cart';

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
function getLocalCart(): InquiryItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: InquiryItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silent fail
  }
}

// ============================================================
// CART OPERATIONS
// ============================================================

/**
 * Get the current inquiry cart.
 */
export async function getInquiryCart(userId?: string | null): Promise<InquiryItem[]> {
  if (!isSupabaseConfigured) {
    return getLocalCart();
  }

  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('inquiry_cart')
    .select(`
      product_id,
      quantity,
      notes,
      products_with_details (*)
    `)
    .eq(userId ? 'user_id' : 'session_id', userId || sessionId);

  if (error || !data) {
    return getLocalCart();
  }

  return (data as Array<{
    quantity: number;
    notes: string | null;
    products_with_details: Record<string, unknown> | null;
  }>)
    .filter(row => row.products_with_details)
    .map(row => ({
      product: mapToTileProduct(row.products_with_details!),
      quantity: row.quantity,
      notes: row.notes || '',
    }));
}

/**
 * Add a product to the inquiry cart.
 */
export async function addToInquiryCart(
  product: TileProduct,
  userId?: string | null
): Promise<void> {
  // Update localStorage immediately
  const local = getLocalCart();
  if (!local.some(item => item.product.id === product.id)) {
    saveLocalCart([...local, { product, quantity: 1, notes: '' }]);
  }

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  await supabase.from('inquiry_cart').upsert({
    product_id: product.id,
    quantity: 1,
    notes: '',
    ...(userId ? { user_id: userId } : { session_id: sessionId }),
  }, { onConflict: userId ? 'user_id,product_id' : 'session_id,product_id' });
}

/**
 * Update an inquiry cart item.
 */
export async function updateInquiryCartItem(
  productId: string,
  updates: Partial<{ quantity: number; notes: string }>,
  userId?: string | null
): Promise<void> {
  // Update localStorage
  const local = getLocalCart();
  const updated = local.map(item =>
    item.product.id === productId
      ? {
          ...item,
          quantity: updates.quantity ?? item.quantity,
          notes: updates.notes ?? item.notes,
        }
      : item
  );
  saveLocalCart(updated);

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  let query = supabase
    .from('inquiry_cart')
    .update(updates)
    .eq('product_id', productId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  await query;
}

/**
 * Remove an item from the inquiry cart.
 */
export async function removeFromInquiryCart(
  productId: string,
  userId?: string | null
): Promise<void> {
  // Update localStorage
  const local = getLocalCart();
  saveLocalCart(local.filter(item => item.product.id !== productId));

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  let query = supabase
    .from('inquiry_cart')
    .delete()
    .eq('product_id', productId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  await query;
}

/**
 * Clear the entire inquiry cart.
 */
export async function clearInquiryCart(userId?: string | null): Promise<void> {
  saveLocalCart([]);

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  let query = supabase.from('inquiry_cart').delete();
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  await query;
}

// ============================================================
// INQUIRY SUBMISSION
// ============================================================

export interface InquirySubmissionResult {
  success: boolean;
  referenceNumber?: string;
  error?: string;
}

/**
 * Submit an inquiry to the database and trigger email notification.
 */
export async function submitInquiry(
  formData: InquiryFormData,
  cartItems: InquiryItem[],
  userId?: string | null
): Promise<InquirySubmissionResult> {
  // Validate form data with Zod
  const validation = inquirySchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid form data',
    };
  }

  if (!isSupabaseConfigured) {
    // Simulate success for development
    const refNumber = `TTS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newInquiry = {
      id: `sim-inq-${Date.now()}`,
      reference_number: refNumber,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || null,
      project_type: formData.projectType || null,
      message: formData.message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      inquiry_items: cartItems.map(item => ({
        products: {
          name: item.product.name,
          code: item.product.code,
        },
        quantity: item.quantity,
        notes: item.notes || null,
      })),
    };
    try {
      const stored = localStorage.getItem('tts-local-inquiries');
      const inquiries = stored ? JSON.parse(stored) : [];
      localStorage.setItem('tts-local-inquiries', JSON.stringify([...inquiries, newInquiry]));
      // Notify admin panel immediately via storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'tts-local-inquiries',
        newValue: JSON.stringify([...inquiries, newInquiry]),
        storageArea: localStorage,
      }));
    } catch (e) {}
    
    // Clear the cart
    await clearInquiryCart(userId);
    return { success: true, referenceNumber: refNumber };
  }

  try {
    // Generate IDs client-side (matching the DB DEFAULT patterns) so we can insert
    // without chaining .select() — a SELECT-after-INSERT triggers the SELECT RLS
    // policy which blocks anonymous users even though the INSERT policy allows them.
    const inquiryId = `TTS-${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`;
    const refNumber = `TTS-${String(Math.floor(Math.random() * 900000) + 100000)}`;

    // 1. Create the inquiry — no .select() so no SELECT RLS check for anon users
    const { error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        id: inquiryId,
        reference_number: refNumber,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || null,
        project_type: formData.projectType || null,
        message: formData.message || null,
        user_id: userId || null,
        session_id: getSessionId(),
      });

    if (inquiryError) {
      throw new Error(inquiryError.message);
    }

    // 2. Add all inquiry items
    if (cartItems.length > 0) {
      const inquiryItems = cartItems.map(item => ({
        inquiry_id: inquiryId,
        product_id: item.product.id,
        quantity: item.quantity,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from('inquiry_items')
        .insert(inquiryItems);

      if (itemsError) {
        console.error('[InquiryService] Failed to save inquiry items:', itemsError);
      }
    }

    // 3. Try to trigger email notification via edge function
    try {
      await supabase.functions.invoke('submit-inquiry', {
        body: {
          inquiryId,
          referenceNumber: refNumber,
          ...formData,
          products: cartItems.map(item => ({
            name: item.product.name,
            code: item.product.code,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      });
    } catch {
      // Email failure should not block the inquiry
      console.warn('[InquiryService] Email notification failed (non-critical)');
    }

    // 4. Clear the cart after successful submission
    await clearInquiryCart(userId);

    return {
      success: true,
      referenceNumber: refNumber,
    };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

// Helper mapper
function mapToTileProduct(row: Record<string, unknown>): TileProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    category: (row.category_slug || 'floor') as TileProduct['category'],
    material: row.material as string,
    finish: row.finish as TileProduct['finish'],
    size: row.size as string,
    origin: row.origin as string,
    priceCategory: row.price_category as TileProduct['priceCategory'],
    image: (row.primary_image_url as string) || '',
    description: row.description as string,
    features: (row.features as string[]) || [],
    color: row.color as string | undefined,
    texture: row.texture as string | undefined,
    antiSkid: (row.anti_skid as boolean) || false,
    usageArea: (row.usage_areas as string[]) || [],
    brand: row.brand_name as string | undefined,
    style: row.style as TileProduct['style'],
    indoorOutdoor: row.indoor_outdoor as TileProduct['indoorOutdoor'],
    textureCategory: row.texture_category as TileProduct['textureCategory'],
    latest: (row.latest as boolean) || false,
    popularityScore: (row.popularity_score as number) || 0,
  };
}

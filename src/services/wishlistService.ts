// @ts-nocheck
// ============================================================
// Wishlist Service â€” DB-backed with localStorage fallback
// Supports anonymous sessions and authenticated users
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId, handleSupabaseError } from '../lib/supabase';
import type { TileProduct } from '../types';

const WISHLIST_STORAGE_KEY = 'atelier-wishlist';

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
function getLocalWishlist(): TileProduct[] {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: TileProduct[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silent fail
  }
}

// ============================================================
// WISHLIST CRUD OPERATIONS
// ============================================================

/**
 * Get the current wishlist.
 * Returns DB wishlist for authenticated users, localStorage for anonymous.
 */
export async function getWishlist(userId?: string | null): Promise<TileProduct[]> {
  // Always include local wishlist as source of truth for non-DB mode
  if (!isSupabaseConfigured) {
    return getLocalWishlist();
  }

  const sessionId = getSessionId();

  // Build query: match by user_id if authenticated, else by session_id
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      product_id,
      products_with_details (*)
    `)
    .eq(userId ? 'user_id' : 'session_id', userId || sessionId);

  if (error || !data) {
    handleSupabaseError(error);
    return getLocalWishlist();
  }

  return (data as Array<{ products_with_details: Record<string, unknown> | null }>)
    .filter(row => row.products_with_details)
    .map(row => mapToTileProduct(row.products_with_details!));
}

/**
 * Add a product to the wishlist.
 */
export async function addToWishlist(
  product: TileProduct,
  userId?: string | null
): Promise<void> {
  // Always update localStorage for instant UI response
  const local = getLocalWishlist();
  if (!local.some(p => p.id === product.id)) {
    saveLocalWishlist([...local, product]);
  }

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  const { error } = await supabase.from('wishlist_items').upsert({
    product_id: product.id,
    ...(userId ? { user_id: userId } : { session_id: sessionId }),
  }, { onConflict: userId ? 'user_id,product_id' : 'session_id,product_id' });

  if (error) {
    handleSupabaseError(error);
  }
}

/**
 * Remove a product from the wishlist.
 */
export async function removeFromWishlist(
  productId: string,
  userId?: string | null
): Promise<void> {
  // Update localStorage immediately
  const local = getLocalWishlist();
  saveLocalWishlist(local.filter(p => p.id !== productId));

  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  let query = supabase
    .from('wishlist_items')
    .delete()
    .eq('product_id', productId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { error } = await query;
  if (error) handleSupabaseError(error);
}

/**
 * Check if a product is in the wishlist.
 */
export async function isInWishlist(
  productId: string,
  userId?: string | null
): Promise<boolean> {
  // Always check local first for instant response
  const local = getLocalWishlist();
  if (local.some(p => p.id === productId)) return true;

  if (!isSupabaseConfigured) return false;

  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('product_id', productId)
    .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
    .limit(1);

  if (error) return false;
  return (data || []).length > 0;
}

/**
 * Sync anonymous session wishlist to user account after login.
 */
export async function syncWishlistToUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();
  const localItems = getLocalWishlist();

  if (localItems.length === 0) return;

  // Upsert all local wishlist items to the user account
  const itemsToSync = localItems.map(p => ({
    user_id: userId,
    product_id: p.id,
  }));

  const { error } = await supabase
    .from('wishlist_items')
    .upsert(itemsToSync, { onConflict: 'user_id,product_id' });

  if (error) {
    handleSupabaseError(error);
    return;
  }

  // Delete session-based items
  await supabase
    .from('wishlist_items')
    .delete()
    .eq('session_id', sessionId);
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

// @ts-nocheck
// ============================================================
// Admin Service — Backend-ready admin API layer
// All admin operations require admin role (enforced by RLS)
// This service is used by the future admin dashboard
// ============================================================
import { supabase, isSupabaseConfigured, getPaginationRange, handleSupabaseError } from '../lib/supabase';
import {
  getLocalProducts,
  saveLocalProducts,
  getLocalCategories,
  saveLocalCategories,
  getLocalBrands,
  saveLocalBrands,
} from './productService';

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================

export interface AdminProductInput {
  name: string;
  code: string;
  slug: string;
  categoryId?: string;
  brandId?: string;
  material: string;
  finish: string;
  size: string;
  origin: string;
  priceCategory: 'Signature' | 'Premium' | 'Reserve';
  description: string;
  features: string[];
  color?: string;
  texture?: string;
  antiSkid?: boolean;
  usageAreas?: string[];
  shape?: string;
  thickness?: string;
  waterAbsorption?: string;
  style?: string;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  textureCategory?: string;
  latest?: boolean;
  popularityScore?: number;
  inStock?: boolean;
}

export async function adminCreateProduct(input: AdminProductInput) {
  if (!isSupabaseConfigured) {
    const newId = `sim-prod-${Date.now()}`;
    const matchedCategory = getLocalCategories().find(c => c.id === input.categoryId);
    const matchedBrand = getLocalBrands().find(b => b.id === input.brandId);

    const newProduct = {
      id: newId,
      name: input.name,
      code: input.code,
      slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: matchedCategory ? matchedCategory.slug : 'floor',
      brand: matchedBrand ? matchedBrand.name : 'Unknown Brand',
      material: input.material || 'Vitrified',
      finish: input.finish || 'Polished',
      size: input.size || '600x600 mm',
      origin: input.origin || 'Imported',
      priceCategory: input.priceCategory || 'Premium',
      image: '',
      description: input.description || '',
      features: input.features || [],
      color: input.color,
      texture: input.texture,
      antiSkid: !!input.antiSkid,
      usageArea: input.usageAreas || [],
      shape: input.shape,
      thickness: input.thickness,
      waterAbsorption: input.waterAbsorption,
      style: input.style,
      indoorOutdoor: input.indoorOutdoor || 'indoor',
      textureCategory: input.textureCategory,
      latest: !!input.latest,
      popularityScore: input.popularityScore || 0,
      inStock: input.inStock !== false,
    };
    const stored = getLocalProducts();
    saveLocalProducts([...stored, newProduct]);
    return { id: newId };
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      code: input.code,
      slug: input.slug,
      category_id: input.categoryId || null,
      brand_id: input.brandId || null,
      material: input.material,
      finish: input.finish as 'Polished' | 'Matte' | 'Satin' | 'High-Gloss' | 'Structured' | 'Lappato',
      size: input.size,
      origin: input.origin,
      price_category: input.priceCategory,
      description: input.description,
      features: input.features,
      color: input.color || null,
      texture: input.texture || null,
      anti_skid: input.antiSkid || false,
      usage_areas: input.usageAreas || [],
      shape: input.shape || null,
      thickness: input.thickness || null,
      water_absorption: input.waterAbsorption || null,
      style: input.style || null,
      indoor_outdoor: input.indoorOutdoor || null,
      texture_category: input.textureCategory || null,
      latest: input.latest || false,
      popularity_score: input.popularityScore || 0,
      in_stock: input.inStock !== false,
    })
    .select('id')
    .single();

  if (error) throw new Error(handleSupabaseError(error).message);
  return data;
}

export async function adminUpdateProduct(id: string, updates: Partial<AdminProductInput>) {
  if (!isSupabaseConfigured) {
    const matchedCategory = updates.categoryId ? getLocalCategories().find(c => c.id === updates.categoryId) : null;
    const matchedBrand = updates.brandId ? getLocalBrands().find(b => b.id === updates.brandId) : null;

    const stored = getLocalProducts();
    const updated = stored.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          category: matchedCategory ? matchedCategory.slug : p.category,
          brand: matchedBrand ? matchedBrand.name : p.brand,
          antiSkid: updates.antiSkid !== undefined ? updates.antiSkid : p.antiSkid,
          usageArea: updates.usageAreas !== undefined ? updates.usageAreas : p.usageArea,
          popularityScore: updates.popularityScore !== undefined ? updates.popularityScore : p.popularityScore,
          inStock: updates.inStock !== undefined ? updates.inStock : p.inStock,
        };
      }
      return p;
    });
    saveLocalProducts(updated);
    return;
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.code !== undefined) dbUpdates.code = updates.code;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
  if (updates.brandId !== undefined) dbUpdates.brand_id = updates.brandId || null;
  if (updates.material !== undefined) dbUpdates.material = updates.material;
  if (updates.finish !== undefined) dbUpdates.finish = updates.finish;
  if (updates.size !== undefined) dbUpdates.size = updates.size;
  if (updates.origin !== undefined) dbUpdates.origin = updates.origin;
  if (updates.priceCategory !== undefined) dbUpdates.price_category = updates.priceCategory;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.features !== undefined) dbUpdates.features = updates.features;
  if (updates.color !== undefined) dbUpdates.color = updates.color || null;
  if (updates.texture !== undefined) dbUpdates.texture = updates.texture || null;
  if (updates.antiSkid !== undefined) dbUpdates.anti_skid = updates.antiSkid;
  if (updates.usageAreas !== undefined) dbUpdates.usage_areas = updates.usageAreas;
  if (updates.shape !== undefined) dbUpdates.shape = updates.shape || null;
  if (updates.thickness !== undefined) dbUpdates.thickness = updates.thickness || null;
  if (updates.waterAbsorption !== undefined) dbUpdates.water_absorption = updates.waterAbsorption || null;
  if (updates.style !== undefined) dbUpdates.style = updates.style || null;
  if (updates.indoorOutdoor !== undefined) dbUpdates.indoor_outdoor = updates.indoorOutdoor || null;
  if (updates.textureCategory !== undefined) dbUpdates.texture_category = updates.textureCategory || null;
  if (updates.latest !== undefined) dbUpdates.latest = updates.latest;
  if (updates.popularityScore !== undefined) dbUpdates.popularity_score = updates.popularityScore;
  if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;

  const { error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw new Error(handleSupabaseError(error).message);
}

export async function adminDeleteProduct(id: string) {
  if (!isSupabaseConfigured) {
    const stored = getLocalProducts();
    saveLocalProducts(stored.filter(p => p.id !== id));
    return;
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(handleSupabaseError(error).message);
}

export async function adminToggleProductStock(id: string, inStock: boolean) {
  if (!isSupabaseConfigured) {
    const stored = getLocalProducts();
    const updated = stored.map(p => p.id === id ? { ...p, inStock } : p);
    saveLocalProducts(updated);
    return;
  }

  await supabase
    .from('products')
    .update({ in_stock: inStock })
    .eq('id', id);
}

// ============================================================
// INQUIRY MANAGEMENT
// ============================================================

export async function adminGetInquiries(
  status?: string,
  page = 1,
  pageSize = 20
) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-inquiries');
      let inquiries = stored ? JSON.parse(stored) : [];
      if (status) {
        inquiries = inquiries.filter((inq: any) => inq.status === status);
      }
      const total = inquiries.length;
      const start = (page - 1) * pageSize;
      const paginated = inquiries.slice(start, start + pageSize);
      return { inquiries: paginated, total };
    } catch (e) {
      return { inquiries: [], total: 0 };
    }
  }

  const { from, to } = getPaginationRange({ page, pageSize });

  let query = supabase
    .from('inquiries')
    .select(`
      *,
      inquiry_items (
        quantity,
        notes,
        products (name, code)
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) return { inquiries: [], total: 0 };

  return { inquiries: data || [], total: count ?? 0 };
}

export async function adminUpdateInquiryStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-inquiries');
      if (stored) {
        const inquiries = JSON.parse(stored);
        const updated = inquiries.map((inq: any) => inq.id === id ? { ...inq, status } : inq);
        localStorage.setItem('tts-local-inquiries', JSON.stringify(updated));
      }
    } catch (e) {}
    return;
  }

  await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id);
}

export async function adminDeleteInquiry(id: string) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-inquiries');
      if (stored) {
        const inquiries = JSON.parse(stored);
        localStorage.setItem('tts-local-inquiries', JSON.stringify(
          inquiries.filter((inq: any) => inq.id !== id)
        ));
      }
    } catch (e) {}
    return;
  }

  // Delete child rows first in case there's no ON DELETE CASCADE
  await supabase.from('inquiry_items').delete().eq('inquiry_id', id);

  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw new Error(handleSupabaseError(error).message);
}

// ============================================================
// BOOKING MANAGEMENT
// ============================================================

export async function adminGetBookings(
  status?: string,
  page = 1,
  pageSize = 20
) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-bookings');
      let bookings = stored ? JSON.parse(stored) : [];
      if (status) {
        bookings = bookings.filter((b: any) => b.status === status);
      }
      const total = bookings.length;
      const start = (page - 1) * pageSize;
      const paginated = bookings.slice(start, start + pageSize);
      return { bookings: paginated, total };
    } catch (e) {
      return { bookings: [], total: 0 };
    }
  }

  const { from, to } = getPaginationRange({ page, pageSize });

  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('booking_date', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) return { bookings: [], total: 0 };

  return { bookings: data || [], total: count ?? 0 };
}

export async function adminUpdateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        const updated = bookings.map((b: any) => b.id === id ? { ...b, status } : b);
        localStorage.setItem('tts-local-bookings', JSON.stringify(updated));
      }
    } catch (e) {}
    return;
  }

  await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);
}

// ============================================================
// PARTNER MANAGEMENT
// ============================================================

export async function adminGetArchitectApplications(status?: string) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-architect-partners');
      let partners = stored ? JSON.parse(stored) : [];
      if (partners.length === 0) {
        partners = [
          {
            id: 'sim-part-01',
            name: 'Alexander Wright',
            company: 'Wright & Partners Architects',
            email: 'alexander@wrightarch.com',
            phone: '+1 212 555 0199',
            project_types: ['Residential', 'Hospitality'],
            website: 'wrightarch.com',
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ];
        localStorage.setItem('tts-local-architect-partners', JSON.stringify(partners));
      }
      if (status) {
        partners = partners.filter((p: any) => p.status === status);
      }
      return partners;
    } catch (e) {
      return [];
    }
  }

  let query = supabase
    .from('architect_partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data } = await query;
  return data || [];
}

export async function adminApprovePartner(
  table: 'architect_partners' | 'dealer_partners' | 'builder_partners',
  id: string
) {
  if (!isSupabaseConfigured) {
    try {
      const storedKey = 'tts-local-architect-partners';
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        const partners = JSON.parse(stored);
        const updated = partners.map((p: any) => p.id === id ? { ...p, status: 'approved' } : p);
        localStorage.setItem(storedKey, JSON.stringify(updated));
      }
    } catch (e) {}
    return;
  }
  await supabase.from(table).update({ status: 'approved' }).eq('id', id);
}

// ============================================================
// ANALYTICS QUERIES
// ============================================================

export interface AnalyticsSummary {
  totalProducts: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalBookings: number;
  pendingBookings: number;
  totalViews: number;
  avgDailyInquiries: number;
  topProducts: Array<{ name: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
}

export async function adminGetAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!isSupabaseConfigured) {
    const productsCount = getLocalProducts().length;
    const inquiries = (() => {
      try {
        const stored = localStorage.getItem('tts-local-inquiries');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    })();
    const bookings = (() => {
      try {
        const stored = localStorage.getItem('tts-local-bookings');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    })();

    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;

    // Compute true 7-day daily average using actual timestamps
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyInquiries = inquiries.filter(i => new Date(i.created_at) >= sevenDaysAgo).length;
    const avgDailyInquiries = parseFloat((weeklyInquiries / 7).toFixed(1));

    return {
      totalProducts: productsCount,
      totalInquiries,
      pendingInquiries,
      totalBookings,
      pendingBookings,
      totalViews: 0,
      avgDailyInquiries,
      topProducts: getLocalProducts().slice(0, 3).map(p => ({ name: p.name, views: p.popularityScore * 2 })),
      topSearches: [],
    };
  }

  const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalProducts },
    { count: totalInquiries },
    { count: pendingInquiries },
    { count: totalBookings },
    { count: pendingBookings },
    { count: totalViews },
    { count: weeklyInquiries },
    { data: topProductsData },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('product_views').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO),
    supabase.from('product_views').select('product_id, products(name)').limit(5),
  ]);

  const avgDailyInquiries = parseFloat(((weeklyInquiries ?? 0) / 7).toFixed(1));

  return {
    totalProducts: totalProducts ?? 0,
    totalInquiries: totalInquiries ?? 0,
    pendingInquiries: pendingInquiries ?? 0,
    totalBookings: totalBookings ?? 0,
    pendingBookings: pendingBookings ?? 0,
    totalViews: totalViews ?? 0,
    avgDailyInquiries,
    topProducts: (topProductsData as Array<{ products: { name: string } }> | null || []).map(
      r => ({ name: r.products?.name || 'Unknown', views: 0 })
    ),
    topSearches: [],
  };
}

// ============================================================
// VISITOR TRACKING
// ============================================================

export interface DailyVisits {
  date: string;
  visits: number;
  unique_visitors: number;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  visitsToday: number;
  daily: DailyVisits[];
  /** false when the underlying page_views/get_visit_stats call itself
   * failed (e.g. Supabase schema cache hasn't picked up the migration
   * yet) — distinct from a successful call that legitimately returns
   * zero visits, so the UI can tell "not wired up" apart from "no
   * traffic yet". */
  available: boolean;
  unavailableReason?: string;
}

/**
 * Real visitor counts backed by the page_views table (see migration
 * 009_page_views_and_seo_settings.sql) — not Vercel logs, which don't
 * exist for this static SPA (no serverless functions handle page
 * requests, so there is nothing for `vercel logs` to record).
 * Returns available:false gracefully if the migration hasn't been
 * applied/synced yet, rather than breaking the Analytics page.
 */
export async function adminGetVisitStats(daysBack = 30): Promise<VisitStats> {
  const empty = (reason?: string): VisitStats => ({
    totalVisits: 0, uniqueVisitors: 0, visitsToday: 0, daily: [],
    available: false, unavailableReason: reason,
  });
  if (!isSupabaseConfigured) return empty('Supabase is not configured.');

  const { data, error } = await supabase.rpc('get_visit_stats', { days_back: daysBack });
  if (error) return empty(error.message);
  if (!data || !data[0]) return empty('No data returned.');

  const row = data[0];
  return {
    totalVisits: Number(row.total_visits || 0),
    uniqueVisitors: Number(row.unique_visitors || 0),
    visitsToday: Number(row.visits_today || 0),
    daily: (row.daily as DailyVisits[]) || [],
    available: true,
  };
}


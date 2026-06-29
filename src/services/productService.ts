// @ts-nocheck
// ============================================================
// Product Service — Enterprise product catalog API
// Graceful fallback to static data when Supabase is not configured
// ============================================================
import { supabase, isSupabaseConfigured, getPaginationRange, handleSupabaseError } from '../lib/supabase';
import { tileProducts as staticProducts, premiumBrands as staticBrands } from '../data/tiles';
import type { TileProduct, BrandItem } from '../types';

const LOCAL_PRODUCTS_KEY = 'tts-local-products';
const LOCAL_BRANDS_KEY = 'tts-local-brands';
const LOCAL_CATEGORIES_KEY = 'tts-local-categories';

const staticCategories = [
  { id: 'marble', name: 'Marble Slabs', slug: 'marble' },
  { id: 'floor', name: 'Floor Tiles', slug: 'floor' },
  { id: 'wall', name: 'Wall Tiles', slug: 'wall' },
  { id: 'bathroom', name: 'Bathroom', slug: 'bathroom' },
  { id: 'kitchen', name: 'Kitchen', slug: 'kitchen' },
  { id: 'outdoor', name: 'Outdoor', slug: 'outdoor' },
  { id: 'wood', name: 'Wood Replicate', slug: 'wood' },
  { id: 'elevation', name: 'Elevation & Facade', slug: 'elevation' },
];

export function getLocalProducts(): TileProduct[] {
  try {
    const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(staticProducts));
      return staticProducts;
    }
    return JSON.parse(stored);
  } catch (e) {
    return staticProducts;
  }
}

export function saveLocalProducts(products: TileProduct[]): void {
  try {
    const val = JSON.stringify(products);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, val);
    window.dispatchEvent(new StorageEvent('storage', {
      key: LOCAL_PRODUCTS_KEY,
      newValue: val,
      storageArea: localStorage,
    }));
  } catch (e) {}
}

export function getLocalBrands(): BrandItem[] {
  try {
    const stored = localStorage.getItem(LOCAL_BRANDS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_BRANDS_KEY, JSON.stringify(staticBrands));
      return staticBrands;
    }
    return JSON.parse(stored);
  } catch (e) {
    return staticBrands;
  }
}

export function saveLocalBrands(brands: BrandItem[]): void {
  try {
    const val = JSON.stringify(brands);
    localStorage.setItem(LOCAL_BRANDS_KEY, val);
    window.dispatchEvent(new StorageEvent('storage', {
      key: LOCAL_BRANDS_KEY,
      newValue: val,
      storageArea: localStorage,
    }));
  } catch (e) {}
}

export function getLocalCategories() {
  try {
    const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(staticCategories));
      return staticCategories;
    }
    return JSON.parse(stored);
  } catch (e) {
    return staticCategories;
  }
}

export function saveLocalCategories(categories: any[]): void {
  try {
    const val = JSON.stringify(categories);
    localStorage.setItem(LOCAL_CATEGORIES_KEY, val);
    window.dispatchEvent(new StorageEvent('storage', {
      key: LOCAL_CATEGORIES_KEY,
      newValue: val,
      storageArea: localStorage,
    }));
  } catch (e) {}
}

// ============================================================
// TYPES
// ============================================================
export interface ProductFilters {
  category?: string;
  brand?: string;
  finish?: string;
  priceCategory?: string;
  color?: string;
  style?: string;
  indoorOutdoor?: string;
  textureCategory?: string;
  antiSkid?: boolean;
  latest?: boolean;
  inStock?: boolean;
  search?: string;
}

export interface ProductsResponse {
  products: TileProduct[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================
// MAPPERS — Convert Supabase DB rows → TileProduct frontend type
// ============================================================
function mapDbProductToTileProduct(row: Record<string, unknown>): TileProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    category: (row.category_slug || row.category_name || 'floor') as TileProduct['category'],
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
    shape: row.shape as string | undefined,
    thickness: row.thickness as string | undefined,
    waterAbsorption: row.water_absorption as string | undefined,
    brand: row.brand_name as string | undefined,
    style: row.style as TileProduct['style'],
    indoorOutdoor: row.indoor_outdoor as TileProduct['indoorOutdoor'],
    textureCategory: row.texture_category as TileProduct['textureCategory'],
    latest: (row.latest as boolean) || false,
    popularityScore: (row.popularity_score as number) || 0,
    slug: row.slug as string | undefined,
    inStock: (row.in_stock as boolean) ?? true,
  };
}

// ============================================================
// STATIC DATA HELPERS — client-side filtering of static data
// ============================================================
function filterStaticProducts(
  filters: ProductFilters,
  sort?: SortOption,
  page = 1,
  pageSize = 20
): ProductsResponse {
  let results = getLocalProducts();

  if (filters.category) {
    results = results.filter(p => p.category === filters.category);
  }
  if (filters.brand) {
    results = results.filter(p => p.brand?.toLowerCase() === filters.brand?.toLowerCase());
  }
  if (filters.finish) {
    results = results.filter(p => p.finish === filters.finish);
  }
  if (filters.priceCategory) {
    results = results.filter(p => p.priceCategory === filters.priceCategory);
  }
  if (filters.color) {
    results = results.filter(p => p.color?.toLowerCase() === filters.color?.toLowerCase());
  }
  if (filters.style) {
    results = results.filter(p => p.style === filters.style);
  }
  if (filters.indoorOutdoor) {
    results = results.filter(p => p.indoorOutdoor === filters.indoorOutdoor || p.indoorOutdoor === 'both');
  }
  if (filters.textureCategory) {
    results = results.filter(p => p.textureCategory === filters.textureCategory);
  }
  if (filters.antiSkid !== undefined) {
    results = results.filter(p => p.antiSkid === filters.antiSkid);
  }
  if (filters.latest) {
    results = results.filter(p => p.latest === true);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort) {
    results.sort((a, b) => {
      const aVal = a[sort.field as keyof TileProduct] as number | string | undefined;
      const bVal = b[sort.field as keyof TileProduct] as number | string | undefined;
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sort.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  const total = results.length;
  const from = (page - 1) * pageSize;
  const paginated = results.slice(from, from + pageSize);

  return {
    products: paginated,
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  };
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Fetch products with filters, sorting, and pagination.
 * Falls back to static data if Supabase is not configured.
 */
export async function getProducts(
  filters: ProductFilters = {},
  sort: SortOption = { field: 'popularity_score', direction: 'desc' },
  page = 1,
  pageSize = 20
): Promise<ProductsResponse> {
  if (!isSupabaseConfigured) {
    return filterStaticProducts(filters, sort, page, pageSize);
  }

  const { from, to } = getPaginationRange({ page, pageSize });

  let query = supabase
    .from('products_with_details')
    .select('*', { count: 'exact' })
    .range(from, to);

  // Apply filters
  if (filters.category) query = query.eq('category_slug', filters.category);
  if (filters.brand) query = query.eq('brand_slug', filters.brand);
  if (filters.finish) query = query.eq('finish', filters.finish);
  if (filters.priceCategory) query = query.eq('price_category', filters.priceCategory);
  if (filters.color) query = query.ilike('color', filters.color);
  if (filters.style) query = query.eq('style', filters.style);
  if (filters.indoorOutdoor) {
    query = query.or(`indoor_outdoor.eq.${filters.indoorOutdoor},indoor_outdoor.eq.both`);
  }
  if (filters.textureCategory) query = query.eq('texture_category', filters.textureCategory);
  if (filters.antiSkid !== undefined) query = query.eq('anti_skid', filters.antiSkid);
  if (filters.latest) query = query.eq('latest', true);
  if (filters.inStock !== false) query = query.eq('in_stock', true);
  if (filters.search) {
    query = query.textSearch('search_vector', filters.search, { type: 'websearch' });
  }

  // Apply sort
  query = query.order(sort.field, { ascending: sort.direction === 'asc' });

  const { data, error, count } = await query;

  if (error) {
    const apiError = handleSupabaseError(error);
    console.warn('[ProductService] Falling back to static data:', apiError.message);
    return filterStaticProducts(filters, sort, page, pageSize);
  }

  const total = count ?? 0;
  return {
    products: (data || []).map(row => mapDbProductToTileProduct(row as Record<string, unknown>)),
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  };
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id: string): Promise<TileProduct | null> {
  if (!isSupabaseConfigured) {
    return getLocalProducts().find(p => p.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return getLocalProducts().find(p => p.id === id) ?? null;
  }

  return mapDbProductToTileProduct(data as Record<string, unknown>);
}

/**
 * Get featured/trending products for the homepage hero.
 */
export async function getFeaturedProducts(limit = 6): Promise<TileProduct[]> {
  if (!isSupabaseConfigured) {
    return [...getLocalProducts()]
      .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('in_stock', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return getLocalProducts().slice(0, limit);
  }

  return data.map(row => mapDbProductToTileProduct(row as Record<string, unknown>));
}

/**
 * Get latest/new arrival products.
 */
export async function getLatestProducts(limit = 8): Promise<TileProduct[]> {
  if (!isSupabaseConfigured) {
    return getLocalProducts().filter(p => p.latest).slice(0, limit);
  }

  const { data, error } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('latest', true)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return getLocalProducts().filter(p => p.latest);
  }

  return data.map(row => mapDbProductToTileProduct(row as Record<string, unknown>));
}

/**
 * Get related products (same category/style) for a product detail page.
 */
export async function getRelatedProducts(productId: string, limit = 6): Promise<TileProduct[]> {
  if (!isSupabaseConfigured) {
    const source = getLocalProducts().find(p => p.id === productId);
    if (!source) return [];
    return getLocalProducts()
      .filter(p => p.id !== productId && (p.category === source.category || p.style === source.style))
      .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
      .slice(0, limit);
  }

  const { data, error } = await supabase.rpc('get_similar_products', {
    product_id: productId,
    limit_count: limit,
  });

  if (error || !data) {
    return getRelatedProductsFallback(productId, limit);
  }

  // Fetch full product details for the returned IDs
  const ids = (data as Array<{ id: string }>).map(r => r.id);
  const { data: products } = await supabase
    .from('products_with_details')
    .select('*')
    .in('id', ids);

  return (products || []).map(row => mapDbProductToTileProduct(row as Record<string, unknown>));
}

async function getRelatedProductsFallback(productId: string, limit: number): Promise<TileProduct[]> {
  const source = getLocalProducts().find(p => p.id === productId);
  if (!source) return [];
  return getLocalProducts()
    .filter(p => p.id !== productId && p.category === source.category)
    .slice(0, limit);
}

/**
 * Get products by category slug.
 */
export async function getProductsByCategory(
  category: string,
  limit = 20
): Promise<TileProduct[]> {
  const result = await getProducts({ category }, { field: 'popularity_score', direction: 'desc' }, 1, limit);
  return result.products;
}

/**
 * Get all brands.
 */
export async function getBrands(): Promise<BrandItem[]> {
  if (!isSupabaseConfigured) {
    return getLocalBrands();
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error || !data) {
    return getLocalBrands();
  }

  return data.map(b => ({
    id: b.id,
    name: b.name,
    image: b.image_url || '',
    description: b.description || '',
    highlights: b.highlights || [],
  }));
}

/**
 * Get all available product categories.
 */
export async function getCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  if (!isSupabaseConfigured) {
    return getLocalCategories();
  }

  const { data, error } = await supabase
    .from('product_categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Log a product view for recommendation analytics.
 */
export async function logProductView(productId: string, sessionId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  await supabase.from('product_views').insert({
    product_id: productId,
    session_id: sessionId,
  });
}

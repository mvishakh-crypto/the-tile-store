// @ts-nocheck
// ============================================================
// Search Service — Enterprise-grade unified search with
// full-text, fuzzy matching, autocomplete, and analytics
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId, handleSupabaseError } from '../lib/supabase';
import { getLocalProducts, getLocalBrands } from './productService';
import type { TileProduct, BrandItem } from '../types';

// ============================================================
// TYPES
// ============================================================
export interface SearchSuggestion {
  type: 'product' | 'brand' | 'category' | 'color' | 'style';
  label: string;
  sublabel?: string;
  imageUrl?: string;
  id?: string;
}

export interface SearchResult {
  products: TileProduct[];
  brands: BrandItem[];
  suggestions: SearchSuggestion[];
  totalProducts: number;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  color?: string;
  style?: string;
  finish?: string;
  priceCategory?: string;
  indoorOutdoor?: string;
}

// Predefined category/attribute options for instant suggestions
const QUICK_CATEGORIES = [
  { slug: 'marble', label: 'Marble Slabs' },
  { slug: 'floor', label: 'Floor Tiles' },
  { slug: 'wall', label: 'Wall Tiles' },
  { slug: 'bathroom', label: 'Bathroom Tiles' },
  { slug: 'kitchen', label: 'Kitchen Tiles' },
  { slug: 'outdoor', label: 'Outdoor Tiles' },
  { slug: 'wood', label: 'Wood Replicate Tiles' },
  { slug: 'elevation', label: 'Elevation & Facade' },
];

const QUICK_COLORS = ['White', 'Black', 'Beige', 'Grey', 'Brown', 'Green', 'Blue', 'Orange'];
const QUICK_STYLES = ['Modern', 'Classic', 'Minimalist', 'Industrial', 'Rustic'];
const QUICK_FINISHES = ['Polished', 'Matte', 'Satin', 'High-Gloss', 'Structured', 'Lappato'];

// ============================================================
// STATIC SEARCH (client-side fallback)
// ============================================================
function searchStaticProducts(query: string, filters?: SearchFilters): TileProduct[] {
  const q = query.toLowerCase().trim();
  const localProducts = getLocalProducts();
  if (!q && !filters) return localProducts;

  let results = [...localProducts];

  if (q) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.style?.toLowerCase().includes(q) ||
      p.finish.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.texture?.toLowerCase().includes(q) ||
      p.usageArea?.some(a => a.toLowerCase().includes(q))
    );
  }

  if (filters?.category) results = results.filter(p => p.category === filters.category);
  if (filters?.brand) results = results.filter(p => p.brand?.toLowerCase() === filters.brand?.toLowerCase());
  if (filters?.color) results = results.filter(p => p.color?.toLowerCase() === filters.color?.toLowerCase());
  if (filters?.style) results = results.filter(p => p.style === filters.style);
  if (filters?.finish) results = results.filter(p => p.finish === filters.finish);
  if (filters?.priceCategory) results = results.filter(p => p.priceCategory === filters.priceCategory);

  return results.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
}

function getStaticSuggestions(partial: string): SearchSuggestion[] {
  const q = partial.toLowerCase();
  const suggestions: SearchSuggestion[] = [];
  const localProducts = getLocalProducts();
  const localBrands = getLocalBrands();

  // Product name matches
  localProducts
    .filter(p => p.name.toLowerCase().startsWith(q) || p.name.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach(p => {
      suggestions.push({
        type: 'product',
        label: p.name,
        sublabel: `${p.finish} ${p.material}`,
        imageUrl: p.image,
        id: p.id,
      });
    });

  // Brand matches
  localBrands
    .filter(b => b.name.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach(b => {
      suggestions.push({
        type: 'brand',
        label: b.name,
        sublabel: 'Brand',
        imageUrl: b.image,
        id: b.id,
      });
    });

  // Category matches
  QUICK_CATEGORIES
    .filter(c => c.label.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach(c => {
      suggestions.push({
        type: 'category',
        label: c.label,
        sublabel: 'Category',
        id: c.slug,
      });
    });

  // Color matches
  QUICK_COLORS
    .filter(c => c.toLowerCase().startsWith(q))
    .slice(0, 2)
    .forEach(c => {
      suggestions.push({
        type: 'color',
        label: c,
        sublabel: 'Color filter',
      });
    });

  return suggestions.slice(0, 8);
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Global search across products, brands, and categories.
 */
export async function globalSearch(
  query: string,
  filters?: SearchFilters,
  limit = 20
): Promise<SearchResult> {
  const trimmed = query.trim();

  if (!isSupabaseConfigured) {
    const products = searchStaticProducts(trimmed, filters);
    const localBrands = getLocalBrands();
    const brands = trimmed
      ? localBrands.filter(b =>
          b.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          b.description.toLowerCase().includes(trimmed.toLowerCase())
        )
      : [];

    return {
      products: products.slice(0, limit),
      brands: brands.slice(0, 3),
      suggestions: getStaticSuggestions(trimmed),
      totalProducts: products.length,
    };
  }

  try {
    // Full-text product search
    let productQuery = supabase
      .from('products_with_details')
      .select('*')
      .eq('in_stock', true)
      .limit(limit);

    if (trimmed) {
      productQuery = productQuery.textSearch('search_vector', trimmed, {
        type: 'websearch',
      });
    }

    if (filters?.category) productQuery = productQuery.eq('category_slug', filters.category);
    if (filters?.brand) productQuery = productQuery.eq('brand_slug', filters.brand);
    if (filters?.color) productQuery = productQuery.ilike('color', filters.color);
    if (filters?.style) productQuery = productQuery.eq('style', filters.style);
    if (filters?.finish) productQuery = productQuery.eq('finish', filters.finish);
    if (filters?.priceCategory) productQuery = productQuery.eq('price_category', filters.priceCategory);

    const [{ data: productData }, { data: brandData }] = await Promise.all([
      productQuery,
      trimmed
        ? supabase
            .from('brands')
            .select('*')
            .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
            .limit(3)
        : { data: [] },
    ]);

    // Log search analytics
    void logSearchQuery(trimmed, (productData || []).length);

    return {
      products: (productData || []).map(row => mapDbRow(row)),
      brands: (brandData || []).map(b => ({
        id: b.id,
        name: b.name,
        image: b.image_url || '',
        description: b.description || '',
        highlights: b.highlights || [],
      })),
      suggestions: await getSearchSuggestions(trimmed),
      totalProducts: (productData || []).length,
    };
  } catch (err) {
    handleSupabaseError(err);
    const products = searchStaticProducts(trimmed, filters);
    return {
      products: products.slice(0, limit),
      brands: [],
      suggestions: getStaticSuggestions(trimmed),
      totalProducts: products.length,
    };
  }
}

function mapDbRow(row: Record<string, unknown>): TileProduct {
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
    shape: row.shape as string | undefined,
    thickness: row.thickness as string | undefined,
    waterAbsorption: row.water_absorption as string | undefined,
    brand: row.brand_name as string | undefined,
    style: row.style as TileProduct['style'],
    indoorOutdoor: row.indoor_outdoor as TileProduct['indoorOutdoor'],
    textureCategory: row.texture_category as TileProduct['textureCategory'],
    latest: (row.latest as boolean) || false,
    popularityScore: (row.popularity_score as number) || 0,
  };
}

/**
 * Get instant autocomplete suggestions for partial query.
 */
export async function getSearchSuggestions(partial: string): Promise<SearchSuggestion[]> {
  if (!partial || partial.length < 2) return [];

  if (!isSupabaseConfigured) {
    return getStaticSuggestions(partial);
  }

  try {
    const [{ data: products }, { data: brands }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, material, finish')
        .ilike('name', `%${partial}%`)
        .order('popularity_score', { ascending: false })
        .limit(4),
      supabase
        .from('brands')
        .select('id, name')
        .ilike('name', `%${partial}%`)
        .limit(2),
    ]);

    const suggestions: SearchSuggestion[] = [];

    (products || []).forEach(p => {
      suggestions.push({
        type: 'product',
        label: p.name,
        sublabel: `${p.finish} ${p.material}`,
        id: p.id,
      });
    });

    (brands || []).forEach(b => {
      suggestions.push({
        type: 'brand',
        label: b.name,
        sublabel: 'Brand',
        id: b.id,
      });
    });

    // Add category/color/style matches
    QUICK_CATEGORIES
      .filter(c => c.label.toLowerCase().includes(partial.toLowerCase()))
      .slice(0, 1)
      .forEach(c => suggestions.push({ type: 'category', label: c.label, id: c.slug }));

    QUICK_COLORS
      .filter(c => c.toLowerCase().startsWith(partial.toLowerCase()))
      .slice(0, 1)
      .forEach(c => suggestions.push({ type: 'color', label: c, sublabel: 'Color filter' }));

    return suggestions.slice(0, 8);
  } catch {
    return getStaticSuggestions(partial);
  }
}

/**
 * Get popular searches (last 30 days).
 */
export async function getPopularSearches(): Promise<string[]> {
  const POPULAR_FALLBACK = [
    'Marble Slab',
    'Matte Black',
    'Kitchen Tiles',
    'Bathroom Wall',
    'Wood Plank',
    'Outdoor Tiles',
    'Calacatta',
    'Travertine',
  ];

  if (!isSupabaseConfigured) return POPULAR_FALLBACK;

  try {
    const { data } = await supabase.rpc('get_popular_searches', { limit_count: 8 });
    if (!data || data.length === 0) return POPULAR_FALLBACK;
    return (data as Array<{ query: string }>).map(r => r.query);
  } catch {
    return POPULAR_FALLBACK;
  }
}

/**
 * Get recent searches for a session.
 */
export function getRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem('atelier-recent-searches');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to recent searches.
 */
export function saveRecentSearch(query: string): void {
  if (!query.trim()) return;
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(r => r !== query)].slice(0, 6);
    localStorage.setItem('atelier-recent-searches', JSON.stringify(updated));
  } catch {
    // Silent fail for localStorage quota issues
  }
}

/**
 * Clear all recent searches.
 */
export function clearRecentSearches(): void {
  localStorage.removeItem('atelier-recent-searches');
}

/**
 * Log a search query for analytics.
 */
async function logSearchQuery(query: string, resultCount: number): Promise<void> {
  if (!query.trim() || !isSupabaseConfigured) return;

  try {
    await supabase.from('search_analytics').insert({
      query: query.trim().toLowerCase(),
      result_count: resultCount,
      session_id: getSessionId(),
    });
  } catch {
    // Analytics logging should never block search
  }
}

/**
 * Log a clicked search result.
 */
export async function logSearchResultClick(query: string, productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase
      .from('search_analytics')
      .insert({
        query: query.trim().toLowerCase(),
        result_count: 1,
        clicked_product_id: productId,
        session_id: getSessionId(),
      });
  } catch {
    // Silent fail
  }
}

// Export quick attribute lists for filter use
export { QUICK_CATEGORIES, QUICK_COLORS, QUICK_STYLES, QUICK_FINISHES };

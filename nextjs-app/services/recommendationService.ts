// @ts-nocheck
// ============================================================
// Recommendation Service — AI-powered tile recommendations
// Multi-signal scoring: category, style, color, popularity, behavior
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId } from '../lib/supabase';
import { getLocalProducts } from './productService';
import type { TileProduct } from '../types';

export interface Recommendation {
  product: TileProduct;
  score: number;
  reason: string;
}

// ============================================================
// STATIC RECOMMENDATION ENGINE (client-side fallback)
// ============================================================
function computeStaticRecommendations(
  sourceProduct: TileProduct,
  limit: number
): Recommendation[] {
  const localProducts = getLocalProducts();
  return localProducts
    .filter(p => p.id !== sourceProduct.id)
    .map(p => {
      let score = 0;
      const reasons: string[] = [];

      if (p.category === sourceProduct.category) {
        score += 0.30;
        reasons.push('Same category');
      }
      if (p.style === sourceProduct.style) {
        score += 0.20;
        reasons.push('Same style');
      }
      if (p.color === sourceProduct.color) {
        score += 0.20;
        reasons.push('Similar color');
      }
      if (p.textureCategory === sourceProduct.textureCategory) {
        score += 0.15;
        reasons.push('Similar texture');
      }
      if (p.finish === sourceProduct.finish) {
        score += 0.10;
        reasons.push('Same finish');
      }
      if (p.indoorOutdoor === sourceProduct.indoorOutdoor) {
        score += 0.05;
      }

      // Normalize by popularity
      score = score + ((p.popularityScore ?? 0) / 1000) * 0.05;

      return {
        product: p,
        score,
        reason: reasons.slice(0, 2).join(' · ') || 'Related design',
      };
    })
    .filter(r => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getStaticRoomRecommendations(roomType: string, limit: number): TileProduct[] {
  const roomCategoryMap: Record<string, string[]> = {
    kitchen: ['kitchen', 'wall', 'floor'],
    bathroom: ['bathroom', 'wall', 'marble'],
    living: ['floor', 'marble', 'wood'],
    outdoor: ['outdoor', 'elevation'],
    bedroom: ['wood', 'floor'],
    office: ['floor', 'marble', 'elevation'],
  };

  const categories = roomCategoryMap[roomType.toLowerCase()] || ['floor'];
  const localProducts = getLocalProducts();

  return localProducts
    .filter(p => categories.includes(p.category))
    .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
    .slice(0, limit);
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Get AI-powered recommendations for a specific product.
 * Uses pre-computed recommendation pairs from the database,
 * falls back to client-side multi-signal scoring.
 */
export async function getProductRecommendations(
  productId: string,
  limit = 6
): Promise<Recommendation[]> {
  const localProducts = getLocalProducts();
  const sourceProduct = localProducts.find(p => p.id === productId);

  if (!isSupabaseConfigured || !sourceProduct) {
    if (!sourceProduct) return [];
    return computeStaticRecommendations(sourceProduct, limit);
  }

  try {
    // First: try pre-computed recommendations from DB
    const { data: precomputed, error } = await supabase
      .from('ai_recommendations')
      .select(`
        score,
        reason,
        recommended_product:products_with_details!recommended_product_id (*)
      `)
      .eq('source_product_id', productId)
      .order('score', { ascending: false })
      .limit(limit);

    if (!error && precomputed && precomputed.length >= 3) {
      return (precomputed as Array<{
        score: number;
        reason: string | null;
        recommended_product: Record<string, unknown> | null;
      }>)
        .filter(r => r.recommended_product)
        .map(r => ({
          product: mapToTileProduct(r.recommended_product!),
          score: r.score,
          reason: r.reason || 'AI recommended',
        }));
    }

    // Fallback: RPC function for live computation
    const { data: rpcData } = await supabase.rpc('get_similar_products', {
      product_id: productId,
      limit_count: limit,
    });

    if (rpcData && rpcData.length > 0) {
      const ids = (rpcData as Array<{ id: string; score: number; reason: string }>).map(r => r.id);
      const { data: products } = await supabase
        .from('products_with_details')
        .select('*')
        .in('id', ids);

      if (products) {
        return (rpcData as Array<{ id: string; score: number; reason: string }>).map(rec => {
          const product = products.find(p => p.id === rec.id);
          return {
            product: product ? mapToTileProduct(product as Record<string, unknown>) : staticProducts[0],
            score: Number(rec.score),
            reason: rec.reason,
          };
        });
      }
    }

    // Final fallback: client-side computation
    return computeStaticRecommendations(sourceProduct, limit);
  } catch {
    if (!sourceProduct) return [];
    return computeStaticRecommendations(sourceProduct, limit);
  }
}

/**
 * Get trending products for a specific room type.
 */
export async function getRecommendationsByRoom(
  roomType: string,
  limit = 8
): Promise<TileProduct[]> {
  if (!isSupabaseConfigured) {
    return getStaticRoomRecommendations(roomType, limit);
  }

  try {
    const roomCategoryMap: Record<string, string[]> = {
      kitchen: ['kitchen', 'wall'],
      bathroom: ['bathroom', 'wall'],
      living: ['floor', 'marble', 'wood'],
      outdoor: ['outdoor', 'elevation'],
    };

    const categories = roomCategoryMap[roomType.toLowerCase()] || ['floor'];

    const { data } = await supabase
      .from('products_with_details')
      .select('*')
      .in('category_slug', categories)
      .eq('in_stock', true)
      .order('popularity_score', { ascending: false })
      .limit(limit);

    return (data || []).map(row => mapToTileProduct(row as Record<string, unknown>));
  } catch {
    return getStaticRoomRecommendations(roomType, limit);
  }
}

/**
 * Get personalized recommendations based on recently viewed products.
 */
export async function getPersonalizedRecommendations(limit = 8): Promise<TileProduct[]> {
  const sessionId = getSessionId();

  if (!isSupabaseConfigured) {
    // Return trending as fallback
    return [...staticProducts]
      .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
      .slice(0, limit);
  }

  try {
    // Get recently viewed products for this session
    const { data: views } = await supabase
      .from('product_views')
      .select('product_id')
      .eq('session_id', sessionId)
      .order('viewed_at', { ascending: false })
      .limit(5);

    if (!views || views.length === 0) {
      // No history: return trending
      const { data } = await supabase
        .from('products_with_details')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(limit);

      return (data || []).map(row => mapToTileProduct(row as Record<string, unknown>));
    }

    // Get recommendations based on the most recently viewed product
    const mostViewedId = views[0].product_id as string;
    const recs = await getProductRecommendations(mostViewedId, limit);
    return recs.map(r => r.product);
  } catch {
    return staticProducts.slice(0, limit);
  }
}

/**
 * Log a product view for recommendation analytics.
 */
export async function logProductView(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const sessionId = getSessionId();

  try {
    await supabase.from('product_views').insert({
      product_id: productId,
      session_id: sessionId,
    });
  } catch {
    // Silent fail
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

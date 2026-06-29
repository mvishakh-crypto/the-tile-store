// @ts-nocheck
// ============================================================
// AI Service — Image Search, Visualizer, and Embeddings
// Uses Gemini API for embeddings and visual analysis
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId } from '../lib/supabase';
import { getLocalProducts } from './productService';
import type { TileProduct } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ============================================================
// TYPES
// ============================================================
export interface ImageSearchResult {
  product: TileProduct;
  similarity: number;
  matchReason: string;
}

export interface VisualizerResult {
  sessionId: string;
  resultImageUrl: string | null;
  success: boolean;
  message: string;
}

// ============================================================
// CLIP EMBEDDING SIMILARITY (client-side for static data)
// ============================================================
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Client-side image similarity search using pre-stored clipEmbedding arrays.
 * For production: embeddings are computed via Gemini and stored in pgvector.
 */
function staticImageSearch(queryEmbedding: number[], limit: number): ImageSearchResult[] {
  const localProducts = getLocalProducts();
  return localProducts
    .filter(p => p.clipEmbedding && p.clipEmbedding.length > 0)
    .map(p => {
      const similarity = cosineSimilarity(queryEmbedding, p.clipEmbedding!);
      let matchReason = 'Visual similarity';

      if (similarity > 0.8) matchReason = 'Strong visual match';
      else if (similarity > 0.6) matchReason = 'Similar design language';
      else if (similarity > 0.4) matchReason = 'Related surface aesthetic';

      return { product: p, similarity, matchReason };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// ============================================================
// IMAGE ANALYSIS WITH GEMINI
// ============================================================

/**
 * Analyze an uploaded image with Gemini to extract visual attributes
 * and generate a pseudo-embedding for similarity matching.
 */
async function analyzeImageWithGemini(imageBase64: string): Promise<{
  embedding: number[];
  attributes: Record<string, string>;
}> {
  if (!GEMINI_API_KEY) {
    // Return a random embedding for testing
    console.warn('[AI Service] Gemini API key not configured. Using mock embedding.');
    return {
      embedding: Array.from({ length: 4 }, () => Math.random()),
      attributes: { color: 'Unknown', texture: 'Unknown', style: 'Unknown' },
    };
  }

  try {
    // Call Gemini Vision API to analyze the image
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: `Analyze this tile or surface image and respond with ONLY a JSON object with these fields:
                {
                  "primaryColor": "one of: White, Black, Beige, Grey, Brown, Green, Blue, Orange",
                  "textureType": "one of: Smooth, Veined, Textured, Artisanal",
                  "style": "one of: Modern, Classic, Minimalist, Industrial, Rustic",
                  "finish": "one of: Polished, Matte, Satin, High-Gloss, Structured, Lappato",
                  "embedding": [4 float values between 0 and 1 representing visual features: lightness, darkness, colorfulness, texture_complexity]
                }`,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) throw new Error('Gemini API error');

    const result = await response.json() as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
      }>;
    };
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const parsed = JSON.parse(jsonMatch[0]) as {
      primaryColor?: string;
      textureType?: string;
      style?: string;
      finish?: string;
      embedding?: number[];
    };

    return {
      embedding: Array.isArray(parsed.embedding) ? parsed.embedding : [0.5, 0.5, 0.5, 0.5],
      attributes: {
        color: parsed.primaryColor || 'Unknown',
        texture: parsed.textureType || 'Unknown',
        style: parsed.style || 'Unknown',
        finish: parsed.finish || 'Unknown',
      },
    };
  } catch (err) {
    console.error('[AI Service] Gemini analysis failed:', err);
    return {
      embedding: [0.5, 0.5, 0.5, 0.5],
      attributes: {},
    };
  }
}

// ============================================================
// IMAGE SEARCH
// ============================================================

/**
 * Search for similar tiles by uploading an image.
 * Flow: Upload image â†’ Gemini analysis â†’ vector/embedding search â†’ return matches
 */
export async function searchByImage(
  imageFile: File,
  limit = 8
): Promise<ImageSearchResult[]> {
  // Convert file to base64
  const base64 = await fileToBase64(imageFile);
  const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

  // Analyze with Gemini
  const { embedding, attributes } = await analyzeImageWithGemini(base64Data);

  if (!isSupabaseConfigured) {
    // Use client-side cosine similarity with static embeddings
    return staticImageSearch(embedding, limit);
  }

  try {
    // Upload image to Supabase Storage for logging
    const fileName = `search-${Date.now()}-${Math.random().toString(36).substr(2, 6)}.jpg`;
    const { data: uploadData } = await supabase.storage
      .from('room-uploads')
      .upload(`ai-search/${fileName}`, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    const imageUrl = uploadData?.path || null;

    // Try vector similarity search via edge function
    let results: ImageSearchResult[] = [];

    try {
      const { data: edgeResult } = await supabase.functions.invoke<{
        matches: Array<{ product_id: string; similarity: number }>;
      }>('ai-image-search', {
        body: {
          embedding,
          attributes,
          imageUrl,
          limit,
        },
      });

      if (edgeResult?.matches && edgeResult.matches.length > 0) {
        const ids = edgeResult.matches.map(m => m.product_id);
        const { data: products } = await supabase
          .from('products_with_details')
          .select('*')
          .in('id', ids);

        if (products) {
          results = edgeResult.matches
            .map(match => {
              const product = products.find(p => p.id === match.product_id);
              if (!product) return null;
              return {
                product: mapToTileProduct(product as Record<string, unknown>),
                similarity: match.similarity,
                matchReason: match.similarity > 0.8
                  ? 'Strong visual match'
                  : match.similarity > 0.6
                  ? 'Similar design language'
                  : 'Related surface aesthetic',
              };
            })
            .filter(Boolean) as ImageSearchResult[];
        }
      }
    } catch {
      // Edge function unavailable: fall back to attribute-based search
    }

    if (results.length === 0) {
      // Attribute-based fallback using Gemini analysis results
      results = await attributeBasedSearch(attributes, limit);
    }

    // Log the AI search
    await logAiSearch(imageUrl, 'image', results.length);

    return results;
  } catch {
    return staticImageSearch(embedding, limit);
  }
}

/**
 * Fallback: search by extracted visual attributes (color, style, etc.)
 */
async function attributeBasedSearch(
  attributes: Record<string, string>,
  limit: number
): Promise<ImageSearchResult[]> {
  if (!isSupabaseConfigured) {
    const localProducts = getLocalProducts();
    return localProducts
      .filter(p =>
        (!attributes.color || p.color?.toLowerCase() === attributes.color.toLowerCase()) ||
        (!attributes.style || p.style?.toLowerCase() === attributes.style.toLowerCase())
      )
      .slice(0, limit)
      .map(p => ({
        product: p,
        similarity: 0.65,
        matchReason: 'Similar visual attributes',
      }));
  }

  let query = supabase
    .from('products_with_details')
    .select('*')
    .eq('in_stock', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (attributes.color && attributes.color !== 'Unknown') {
    query = query.ilike('color', attributes.color);
  }
  if (attributes.style && attributes.style !== 'Unknown') {
    query = query.eq('style', attributes.style);
  }

  const { data } = await query;

  return (data || []).map(row => ({
    product: mapToTileProduct(row as Record<string, unknown>),
    similarity: 0.65,
    matchReason: 'Similar color and style',
  }));
}

// ============================================================
// VISUALIZER SESSION
// ============================================================

/**
 * Save a visualizer session to the database.
 */
export async function saveVisualizerSession(
  roomType: string,
  tileId: string,
  roomImageUrl?: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await supabase
      .from('visualizer_sessions')
      .insert({
        room_type: roomType,
        selected_tile_id: tileId,
        room_image_url: roomImageUrl || null,
        session_id: getSessionId(),
      })
      .select('id')
      .single();

    return data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Upload a room photo to Supabase Storage for the AI visualizer.
 */
export async function uploadRoomPhoto(
  file: File
): Promise<{ url: string; path: string } | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `rooms/${getSessionId()}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('room-uploads')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error || !data) return null;

    const { data: publicUrl } = supabase.storage
      .from('room-uploads')
      .getPublicUrl(data.path);

    return { url: publicUrl.publicUrl, path: data.path };
  } catch {
    return null;
  }
}

// ============================================================
// HELPERS
// ============================================================

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

async function logAiSearch(
  imageUrl: string | null,
  type: 'image' | 'text',
  resultCount: number
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('ai_search_logs').insert({
      search_type: type,
      image_url: imageUrl,
      result_count: resultCount,
      session_id: getSessionId(),
    });
  } catch {
    // Silent fail
  }
}

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

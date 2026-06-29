// ============================================================
// Edge Function: ai-image-search
// Receives an embedding + optional attributes, performs
// vector similarity search via pgvector, returns ranked matches
// Deploy: supabase functions deploy ai-image-search
// ============================================================
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  embedding: number[];
  attributes?: {
    color?: string;
    texture?: string;
    style?: string;
    finish?: string;
  };
  imageUrl?: string;
  limit?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body: RequestBody = await req.json();
    const { embedding, attributes, limit = 10 } = body;

    if (!embedding || !Array.isArray(embedding)) {
      return new Response(
        JSON.stringify({ error: 'embedding array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pad or truncate embedding to 768 dimensions (for pgvector compatibility)
    let normalizedEmbedding: number[];
    if (embedding.length < 768) {
      normalizedEmbedding = [
        ...embedding,
        ...new Array(768 - embedding.length).fill(0),
      ];
    } else {
      normalizedEmbedding = embedding.slice(0, 768);
    }

    // Vector similarity search using pgvector
    const { data: vectorMatches, error: vectorError } = await supabase.rpc(
      'search_by_embedding',
      {
        query_embedding: normalizedEmbedding,
        match_threshold: 0.5,
        match_count: limit * 2, // Fetch more for post-filtering
      }
    );

    let matches: Array<{ product_id: string; similarity: number }> = [];

    if (!vectorError && vectorMatches && vectorMatches.length > 0) {
      matches = vectorMatches as Array<{ product_id: string; similarity: number }>;
    } else {
      // Fallback: attribute-based search when no vector matches
      console.warn('[ai-image-search] Vector search returned no results, using attribute fallback');

      let query = supabase
        .from('products')
        .select('id')
        .eq('in_stock', true)
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (attributes?.color && attributes.color !== 'Unknown') {
        query = query.ilike('color', `%${attributes.color}%`);
      }
      if (attributes?.style && attributes.style !== 'Unknown') {
        query = query.eq('style', attributes.style);
      }

      const { data: attrMatches } = await query;
      matches = (attrMatches || []).map((r: { id: string }) => ({
        product_id: r.id,
        similarity: 0.6,
      }));
    }

    // Re-rank by combining vector similarity with popularity
    const { data: products } = await supabase
      .from('products')
      .select('id, popularity_score')
      .in('id', matches.map(m => m.product_id));

    const popularityMap = new Map(
      (products || []).map((p: { id: string; popularity_score: number }) => [p.id, p.popularity_score])
    );

    const reranked = matches
      .map(m => ({
        product_id: m.product_id,
        similarity: m.similarity * 0.85 + ((popularityMap.get(m.product_id) || 0) / 100) * 0.15,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return new Response(
      JSON.stringify({ matches: reranked }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('[ai-image-search] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', matches: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

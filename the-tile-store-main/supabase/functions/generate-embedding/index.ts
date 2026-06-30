// ============================================================
// generate-embedding — Deno Edge Function
// Generates Gemini text embeddings for product AI search
// POST body: { productId: string, text: string }
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  productId: string;
  text: string;
  modelVersion?: string;
}

interface GeminiEmbeddingResponse {
  embedding: {
    values: number[];
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId, text, modelVersion = "text-embedding-004" }: RequestBody =
      await req.json();

    if (!productId || !text) {
      return new Response(
        JSON.stringify({ error: "productId and text are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Call Gemini Embeddings API ──────────────────────────────
    // Uses text-embedding-004 which outputs 768-dimensional vectors
    // compatible with pgvector's vector(768) column
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${modelVersion}`,
          content: {
            parts: [{ text }],
          },
          taskType: "RETRIEVAL_DOCUMENT",
          title: `Product: ${productId}`,
        }),
      }
    );

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      throw new Error(`Gemini API error: ${embeddingResponse.status} — ${errText}`);
    }

    const embeddingData = await embeddingResponse.json() as GeminiEmbeddingResponse;
    const embedding = embeddingData.embedding?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Gemini returned empty embedding");
    }

    // ── Upsert into Supabase vector_embeddings ──────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("vector_embeddings")
      .upsert(
        {
          product_id: productId,
          embedding: `[${embedding.join(",")}]`, // pgvector format
          model_version: modelVersion,
        },
        { onConflict: "product_id" }
      )
      .select("id")
      .single();

    if (error) {
      throw new Error(`DB upsert failed: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        embeddingId: data?.id,
        dimensions: embedding.length,
        model: modelVersion,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-embedding]", message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

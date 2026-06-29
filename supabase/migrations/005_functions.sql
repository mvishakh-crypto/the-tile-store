-- ============================================================
-- THE TILE STORE — Stored Functions & RPC
-- Migration: 005_functions.sql
-- Adds all PostgreSQL stored functions called via supabase.rpc()
-- ============================================================

-- Requires pg_trgm for fuzzy matching (already added in 001)
-- Requires vector extension (already added in 001)

-- ============================================================
-- get_popular_searches
-- Returns the top-N most common search queries in the last 30 days
-- ============================================================
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INTEGER DEFAULT 8)
RETURNS TABLE(query TEXT, count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    sa.query,
    COUNT(*) AS count
  FROM search_analytics sa
  WHERE
    sa.created_at >= NOW() - INTERVAL '30 days'
    AND sa.query IS NOT NULL
    AND LENGTH(sa.query) > 2
  GROUP BY sa.query
  ORDER BY count DESC
  LIMIT limit_count;
$$;

-- ============================================================
-- search_by_embedding
-- Vector similarity search using pgvector cosine distance
-- Used by the ai-image-search edge function
-- ============================================================
CREATE OR REPLACE FUNCTION search_by_embedding(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INTEGER DEFAULT 20
)
RETURNS TABLE(product_id UUID, similarity FLOAT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ve.product_id,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM vector_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- get_similar_products
-- Multi-signal product similarity function:
-- category, style, color, texture, finish, popularity
-- Used as fallback when no AI embeddings are available
-- ============================================================
CREATE OR REPLACE FUNCTION get_similar_products(
  product_id UUID,
  limit_count INTEGER DEFAULT 6
)
RETURNS TABLE(id UUID, name TEXT, score FLOAT, reason TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  source_category_id UUID;
  source_style TEXT;
  source_color TEXT;
  source_texture_category TEXT;
  source_finish TEXT;
  source_indoor_outdoor TEXT;
BEGIN
  -- Get source product attributes
  SELECT
    p.category_id,
    p.style,
    p.color,
    p.texture_category,
    p.finish,
    p.indoor_outdoor
  INTO
    source_category_id,
    source_style,
    source_color,
    source_texture_category,
    source_finish,
    source_indoor_outdoor
  FROM products p
  WHERE p.id = product_id;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    (
      -- Category match: highest weight (30%)
      CASE WHEN p.category_id = source_category_id THEN 0.30 ELSE 0.0 END +
      -- Style match (20%)
      CASE WHEN p.style = source_style AND source_style IS NOT NULL THEN 0.20 ELSE 0.0 END +
      -- Color match (20%)
      CASE WHEN p.color = source_color AND source_color IS NOT NULL THEN 0.20 ELSE 0.0 END +
      -- Texture match (15%)
      CASE WHEN p.texture_category = source_texture_category AND source_texture_category IS NOT NULL THEN 0.15 ELSE 0.0 END +
      -- Finish match (10%)
      CASE WHEN p.finish = source_finish AND source_finish IS NOT NULL THEN 0.10 ELSE 0.0 END +
      -- Indoor/Outdoor compatibility (5%)
      CASE WHEN p.indoor_outdoor = source_indoor_outdoor OR p.indoor_outdoor = 'both' THEN 0.05 ELSE 0.0 END +
      -- Popularity bonus (normalized 0-5%)
      (p.popularity_score::FLOAT / 100.0) * 0.05
    )::FLOAT AS score,
    -- Generate human-readable reason
    CASE
      WHEN p.category_id = source_category_id AND p.style = source_style THEN 'Same category and style'
      WHEN p.category_id = source_category_id AND p.color = source_color THEN 'Same category and color'
      WHEN p.category_id = source_category_id THEN 'Same collection category'
      WHEN p.style = source_style AND p.color = source_color THEN 'Similar style and color'
      WHEN p.style = source_style THEN 'Similar design style'
      WHEN p.color = source_color THEN 'Similar color palette'
      WHEN p.texture_category = source_texture_category THEN 'Similar surface texture'
      ELSE 'Related design family'
    END AS reason
  FROM products p
  WHERE
    p.id <> product_id
    AND p.in_stock = TRUE
    AND (
      p.category_id = source_category_id OR
      p.style = source_style OR
      p.color = source_color OR
      p.texture_category = source_texture_category
    )
  ORDER BY score DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================
-- search_products_fts
-- Full-text search using pre-built tsvector column
-- ============================================================
CREATE OR REPLACE FUNCTION search_products_fts(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(id UUID, name TEXT, similarity FLOAT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.name,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)) AS similarity
  FROM products p
  WHERE
    p.search_vector @@ websearch_to_tsquery('english', search_query)
    AND p.in_stock = TRUE
  ORDER BY similarity DESC
  LIMIT limit_count;
$$;

-- ============================================================
-- update_product_search_vector
-- Trigger function to rebuild tsvector on product update
-- ============================================================
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.material, '') || ' ' ||
    COALESCE(NEW.color, '') || ' ' ||
    COALESCE(NEW.finish, '') || ' ' ||
    COALESCE(NEW.style, '') || ' ' ||
    COALESCE(NEW.texture, '') || ' ' ||
    COALESCE(NEW.origin, '') || ' ' ||
    COALESCE(array_to_string(NEW.features, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.usage_areas, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if products table exists)
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ============================================================
-- increment_blog_view_count
-- Safe atomic view counter for blog posts
-- ============================================================
CREATE OR REPLACE FUNCTION increment_blog_view_count(blog_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE blogs
  SET view_count = view_count + 1
  WHERE id = blog_id;
$$;

-- ============================================================
-- get_dashboard_stats
-- Admin analytics summary query
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM products),
    'total_inquiries', (SELECT COUNT(*) FROM inquiries),
    'pending_inquiries', (SELECT COUNT(*) FROM inquiries WHERE status = 'pending'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'total_views_7d', (SELECT COUNT(*) FROM product_views WHERE viewed_at >= NOW() - INTERVAL '7 days'),
    'top_products', (
      SELECT json_agg(t)
      FROM (
        SELECT p.name, COUNT(*) AS views
        FROM product_views pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.viewed_at >= NOW() - INTERVAL '30 days'
        GROUP BY p.name
        ORDER BY views DESC
        LIMIT 5
      ) t
    ),
    'popular_searches', (
      SELECT json_agg(t)
      FROM (
        SELECT sa.query, COUNT(*) AS count
        FROM search_analytics sa
        WHERE sa.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY sa.query
        ORDER BY count DESC
        LIMIT 5
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

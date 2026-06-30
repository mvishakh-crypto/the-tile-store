-- ============================================================
-- Migration 007: Blog Full-Text Search Vector
-- Adds search_vector to blogs for full-text search
-- Required by blogService.searchBlogs()
-- ============================================================

-- Add search_vector column if not exists
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate existing rows
UPDATE blogs SET search_vector = to_tsvector('english',
  COALESCE(title, '') || ' ' ||
  COALESCE(excerpt, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), '') || ' ' ||
  COALESCE(author_name, '')
);

-- GIN index for fast FTS queries
CREATE INDEX IF NOT EXISTS idx_blogs_search ON blogs USING GIN(search_vector);

-- Trigger to auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION update_blog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.excerpt, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(NEW.author_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blogs_search_vector_update ON blogs;
CREATE TRIGGER blogs_search_vector_update
  BEFORE INSERT OR UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_blog_search_vector();

-- ============================================================
-- Migration 007: Visualizer Sessions Table
-- Required by analytics.trackVisualizerUsed()
-- ============================================================

CREATE TABLE IF NOT EXISTS visualizer_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      TEXT NOT NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  room_type       TEXT NOT NULL,
  selected_tile_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visualizer_sessions_session
  ON visualizer_sessions(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visualizer_sessions_tile
  ON visualizer_sessions(selected_tile_id);

-- RLS
ALTER TABLE visualizer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visualizer_sessions_insert_anyone"
  ON visualizer_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "visualizer_sessions_admin_select"
  ON visualizer_sessions FOR SELECT
  USING (is_admin());

-- ============================================================
-- Migration 007: Search Analytics Enhancements
-- Add click-through tracking + popular searches function
-- Required by analytics.trackSearchResultClick()
-- ============================================================

-- Add clicked_product_id column (soft reference)
ALTER TABLE search_analytics
  ADD COLUMN IF NOT EXISTS clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Index for CTR analysis
CREATE INDEX IF NOT EXISTS idx_search_analytics_clicked
  ON search_analytics(clicked_product_id)
  WHERE clicked_product_id IS NOT NULL;

-- ============================================================
-- Migration 007: get_popular_searches function
-- Required by adminService.adminGetAnalyticsSummary()
-- ============================================================
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(query TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.query,
    COUNT(*) AS count
  FROM search_analytics sa
  WHERE sa.created_at >= NOW() - INTERVAL '30 days'
    AND LENGTH(sa.query) > 2
  GROUP BY sa.query
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_popular_searches(INTEGER) TO authenticated, anon;

-- ============================================================
-- Migration 007: increment_blog_views function  
-- Required by blogService.incrementBlogViewCount()
-- ============================================================
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blogs
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO authenticated, anon;

-- ============================================================
-- Migration 007: Inquiry items missing table fix
-- Ensure inquiry_items exists properly
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiry_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id  UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_items_inquiry
  ON inquiry_items(inquiry_id);

ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_items_owner_access"
  ON inquiry_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM inquiries i
      WHERE i.id = inquiry_id
        AND (i.user_id = auth.uid() OR is_admin())
    )
  );

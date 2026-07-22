-- ============================================================
-- is_admin() — defined here with CREATE OR REPLACE so this
-- migration is self-contained regardless of whether an earlier
-- migration already created it in this database.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PAGE VIEWS — lightweight visitor/session tracking for the
-- admin-panel visitor counter (total visits, unique visitors,
-- daily trend). Nothing tracked visits before this migration —
-- counts start accumulating from the moment this is applied.
-- ============================================================
CREATE TABLE page_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT NOT NULL,
  path        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Any site visitor (anon) can record their own page-view events.
CREATE POLICY "page_views_public_insert" ON page_views
  FOR INSERT WITH CHECK (TRUE);

-- Only admins can read the raw log.
CREATE POLICY "page_views_admin_read" ON page_views
  FOR SELECT USING (is_admin());

-- Aggregate stats for the admin panel. SECURITY INVOKER (the
-- default) — no need to duplicate the is_admin() check here since
-- the underlying SELECT already goes through the RLS policy above:
-- a non-admin caller simply sees zero rows, not an error.
CREATE OR REPLACE FUNCTION get_visit_stats(days_back INT DEFAULT 30)
RETURNS TABLE (
  total_visits    BIGINT,
  unique_visitors BIGINT,
  visits_today    BIGINT,
  daily           JSONB
) AS $$
  SELECT
    (SELECT COUNT(*) FROM page_views) AS total_visits,
    (SELECT COUNT(DISTINCT session_id) FROM page_views) AS unique_visitors,
    (SELECT COUNT(*) FROM page_views WHERE created_at >= date_trunc('day', NOW())) AS visits_today,
    (
      SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb)
      FROM (
        SELECT
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
          COUNT(*) AS visits,
          COUNT(DISTINCT session_id) AS unique_visitors
        FROM page_views
        WHERE created_at >= NOW() - (days_back || ' days')::interval
        GROUP BY date_trunc('day', created_at)
        ORDER BY date_trunc('day', created_at)
      ) d
    ) AS daily;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- SEO SETTINGS — admin-editable site-wide + per-page meta config.
-- Seeded with the values currently hardcoded in src/lib/seo.ts so
-- the table starts populated with exactly what's already live.
-- ============================================================
CREATE TABLE seo_settings (
  page_key     TEXT PRIMARY KEY,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  og_image_url TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- The public site needs to read this on every page load to render meta tags.
CREATE POLICY "seo_settings_public_read" ON seo_settings
  FOR SELECT USING (TRUE);

-- Only admins can edit it.
CREATE POLICY "seo_settings_admin_write" ON seo_settings
  FOR ALL USING (is_admin());

INSERT INTO seo_settings (page_key, title, description, og_image_url) VALUES
  ('global', 'The Tile Store — Premium Luxury Surfaces & Interiors',
   'Discover premium luxury tiles, marble slabs, and designer surfaces. Curated collections for architects and interior designers in Kerala and across India.',
   'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'),
  ('home', 'The Tile Store — Premium Luxury Surfaces & Interiors | Curated Slabs & Tile Archive',
   'Discover premium luxury tiles, marble slabs, and designer surfaces. Curated collections for architects and interior designers in Kerala and across India.',
   NULL),
  ('collections', 'Tile Collections — Italian Porcelain, Marble Slabs & Designer Surfaces',
   'Explore our luxury tile collections. Filter by brand, style, size, finish, and price category. From Statuario marble to artisanal Zellige.',
   NULL),
  ('calculator', 'Tile Area Calculator — Accurate Quantity & Cost Estimator | The Tile Store',
   'Calculate the exact number of tile boxes and material cost for your project. Includes wastage factor, grout, adhesive estimation.',
   NULL),
  ('partners', 'B2B Trade Portal — Architect, Builder & Dealer Partnerships | The Tile Store',
   'Join the Atelier Trade Program. Access wholesale B2B pricing, CAD spec files, priority sample boxes, and dedicated account management.',
   NULL)
ON CONFLICT (page_key) DO NOTHING;

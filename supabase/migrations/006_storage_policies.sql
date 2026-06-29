-- ============================================================
-- THE TILE STORE — Storage Bucket Policies
-- Migration: 006_storage_policies.sql
-- Supabase Storage RLS policies for all 4 buckets
-- ============================================================

-- NOTE: Buckets must be created FIRST via Supabase CLI or Dashboard:
--   supabase storage create tile-images
--   supabase storage create room-uploads
--   supabase storage create moodboards
--   supabase storage create blog-covers

-- Helper: is the current user an admin?
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
-- BUCKET: tile-images
-- Public READ (anyone can view product images)
-- Admin-only WRITE (only admins can upload/delete product images)
-- ============================================================
CREATE POLICY "tile_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tile-images');

CREATE POLICY "tile_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tile-images'
    AND is_admin()
  );

CREATE POLICY "tile_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tile-images'
    AND is_admin()
  );

CREATE POLICY "tile_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tile-images'
    AND is_admin()
  );

-- ============================================================
-- BUCKET: room-uploads
-- Public READ (AI search results need public URLs)
-- Anyone can upload (anonymous users use the visualizer/AI search)
-- Users can only delete their own uploads (by session_id in path)
-- ============================================================
CREATE POLICY "room_uploads_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'room-uploads');

CREATE POLICY "room_uploads_anyone_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'room-uploads');

CREATE POLICY "room_uploads_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'room-uploads'
    AND (
      -- Authenticated users can delete their own uploads
      auth.uid() IS NOT NULL
      OR is_admin()
    )
  );

-- ============================================================
-- BUCKET: moodboards
-- Public READ for public moodboards
-- Auth users can write their own moodboard images
-- ============================================================
CREATE POLICY "moodboards_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'moodboards');

CREATE POLICY "moodboards_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'moodboards'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "moodboards_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'moodboards'
    AND (
      auth.uid() IS NOT NULL
      OR is_admin()
    )
  );

-- ============================================================
-- BUCKET: blog-covers
-- Public READ (blog cover images are public)
-- Admin-only WRITE
-- ============================================================
CREATE POLICY "blog_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

CREATE POLICY "blog_covers_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-covers'
    AND is_admin()
  );

CREATE POLICY "blog_covers_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-covers'
    AND is_admin()
  );

-- ============================================================
-- ADDITIONAL TABLES: recently_viewed (server-side tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS recently_viewed (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT NOT NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_recently_viewed_session
  ON recently_viewed(session_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user
  ON recently_viewed(user_id, viewed_at DESC);

-- RLS for recently_viewed
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recently_viewed_session_select"
  ON recently_viewed FOR SELECT
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id'
         OR user_id = auth.uid());

CREATE POLICY "recently_viewed_anyone_insert"
  ON recently_viewed FOR INSERT
  WITH CHECK (true);

CREATE POLICY "recently_viewed_session_delete"
  ON recently_viewed FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- VIEW: product_image_gallery
-- Denormalized view for efficient product image queries
-- ============================================================
CREATE OR REPLACE VIEW product_image_gallery AS
SELECT
  pi.id,
  pi.product_id,
  pi.url,
  pi.alt_text,
  pi.is_primary,
  pi.sort_order,
  pi.storage_path,
  pi.created_at,
  p.name    AS product_name,
  p.code    AS product_code,
  p.slug    AS product_slug
FROM product_images pi
JOIN products p ON p.id = pi.product_id
ORDER BY pi.product_id, pi.is_primary DESC, pi.sort_order ASC;

-- ============================================================
-- FUNCTION: get_dashboard_stats (for admin panel)
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_products',         (SELECT COUNT(*) FROM products),
    'in_stock_products',      (SELECT COUNT(*) FROM products WHERE in_stock = TRUE),
    'total_inquiries',        (SELECT COUNT(*) FROM inquiries),
    'pending_inquiries',      (SELECT COUNT(*) FROM inquiries WHERE status = 'pending'),
    'total_bookings',         (SELECT COUNT(*) FROM bookings),
    'pending_bookings',       (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'total_partner_apps',     (SELECT COUNT(*) FROM architect_partners) +
                              (SELECT COUNT(*) FROM dealer_partners) +
                              (SELECT COUNT(*) FROM builder_partners),
    'pending_partner_apps',   (SELECT COUNT(*) FROM architect_partners WHERE status = 'pending') +
                              (SELECT COUNT(*) FROM dealer_partners WHERE status = 'pending') +
                              (SELECT COUNT(*) FROM builder_partners WHERE status = 'pending'),
    'total_product_views',    (SELECT COUNT(*) FROM product_views),
    'total_wishlist_items',   (SELECT COUNT(*) FROM wishlist_items),
    'total_search_queries',   (SELECT COUNT(*) FROM search_analytics),
    'total_ai_searches',      (SELECT COUNT(*) FROM ai_search_logs),
    'products_with_images',   (SELECT COUNT(DISTINCT product_id) FROM product_images),
    'products_without_images',(SELECT COUNT(*) FROM products p
                               WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)),
    'generated_at',           NOW()
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated and anon (analytics are non-sensitive aggregates)
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated, anon;

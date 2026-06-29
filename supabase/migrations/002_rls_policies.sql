-- ============================================================
-- THE TILE STORE — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compare_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE architect_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: is the current user an admin?
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
-- PUBLIC READ — Catalog tables (products, brands, categories)
-- ============================================================

-- Brands: public read, admin write
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (TRUE);
CREATE POLICY "brands_admin_write" ON brands FOR ALL USING (is_admin());

-- Product categories: public read, admin write
CREATE POLICY "categories_public_read" ON product_categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write" ON product_categories FOR ALL USING (is_admin());

-- Products: public read for in-stock, admin full access
CREATE POLICY "products_public_read" ON products FOR SELECT USING (TRUE);
CREATE POLICY "products_admin_all" ON products FOR ALL USING (is_admin());

-- Product variants: public read
CREATE POLICY "variants_public_read" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "variants_admin_all" ON product_variants FOR ALL USING (is_admin());

-- Product images: public read
CREATE POLICY "images_public_read" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "images_admin_all" ON product_images FOR ALL USING (is_admin());

-- Product tags: public read
CREATE POLICY "tags_public_read" ON product_tags FOR SELECT USING (TRUE);
CREATE POLICY "tags_admin_all" ON product_tags FOR ALL USING (is_admin());

-- AI recommendations: public read
CREATE POLICY "recommendations_public_read" ON ai_recommendations FOR SELECT USING (TRUE);
CREATE POLICY "recommendations_admin_all" ON ai_recommendations FOR ALL USING (is_admin());

-- Testimonials: public read
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "testimonials_admin_all" ON testimonials FOR ALL USING (is_admin());

-- Galleries: public read
CREATE POLICY "galleries_public_read" ON galleries FOR SELECT USING (TRUE);
CREATE POLICY "galleries_admin_all" ON galleries FOR ALL USING (is_admin());

-- Inspirations: public read
CREATE POLICY "inspirations_public_read" ON inspirations FOR SELECT USING (TRUE);
CREATE POLICY "inspirations_admin_all" ON inspirations FOR ALL USING (is_admin());

-- Blogs: public read for published posts
CREATE POLICY "blogs_public_read" ON blogs FOR SELECT USING (published = TRUE OR is_admin());
CREATE POLICY "blogs_admin_all" ON blogs FOR ALL USING (is_admin());

-- Blog categories: public read
CREATE POLICY "blog_categories_public_read" ON blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "blog_categories_admin_all" ON blog_categories FOR ALL USING (is_admin());

-- Vector embeddings: public read (needed for AI search)
CREATE POLICY "embeddings_public_read" ON vector_embeddings FOR SELECT USING (TRUE);
CREATE POLICY "embeddings_admin_all" ON vector_embeddings FOR ALL USING (is_admin());

-- ============================================================
-- PROFILES — Users can read/update their own profile
-- ============================================================
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- ============================================================
-- ADDRESSES — Users manage their own addresses
-- ============================================================
CREATE POLICY "addresses_own_crud" ON addresses
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- USER PREFERENCES — Users manage their own preferences
-- ============================================================
CREATE POLICY "preferences_own_crud" ON user_preferences
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- WISHLIST — Users manage own wishlist; anon by session_id
-- ============================================================
CREATE POLICY "wishlist_own_read" ON wishlist_items
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

CREATE POLICY "wishlist_own_insert" ON wishlist_items
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
  );

CREATE POLICY "wishlist_own_delete" ON wishlist_items
  FOR DELETE USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

-- ============================================================
-- COMPARE ITEMS — Same as wishlist
-- ============================================================
CREATE POLICY "compare_own_read" ON compare_items
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

CREATE POLICY "compare_own_insert" ON compare_items
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "compare_own_delete" ON compare_items
  FOR DELETE USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

-- ============================================================
-- INQUIRY CART — Session-scoped
-- ============================================================
CREATE POLICY "cart_own_crud" ON inquiry_cart
  FOR ALL USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

-- ============================================================
-- INQUIRIES — Users see their own; admin sees all
-- ============================================================
CREATE POLICY "inquiries_own_insert" ON inquiries
  FOR INSERT WITH CHECK (TRUE);  -- Anyone can submit an inquiry

CREATE POLICY "inquiries_own_read" ON inquiries
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

CREATE POLICY "inquiries_admin_update" ON inquiries
  FOR UPDATE USING (is_admin());

-- ============================================================
-- INQUIRY ITEMS — Read by inquiry owner or admin
-- ============================================================
CREATE POLICY "inquiry_items_read" ON inquiry_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inquiries i
      WHERE i.id = inquiry_items.inquiry_id
        AND (i.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "inquiry_items_insert" ON inquiry_items
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- BOOKINGS — Submit public; read own or admin
-- ============================================================
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "bookings_own_read" ON bookings
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "bookings_admin_update" ON bookings
  FOR UPDATE USING (is_admin());

-- ============================================================
-- MOODBOARDS — Own or public
-- ============================================================
CREATE POLICY "moodboards_read" ON moodboards
  FOR SELECT USING (
    is_public = TRUE
    OR user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

CREATE POLICY "moodboards_own_write" ON moodboards
  FOR ALL USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

-- ============================================================
-- MOODBOARD ITEMS
-- ============================================================
CREATE POLICY "moodboard_items_crud" ON moodboard_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM moodboards m
      WHERE m.id = moodboard_items.moodboard_id
        AND (m.user_id = auth.uid() OR is_admin())
    )
  );

-- ============================================================
-- SAVED COLLECTIONS — Own only
-- ============================================================
CREATE POLICY "collections_own_crud" ON saved_collections
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- VISUALIZER SESSIONS — Own or admin
-- ============================================================
CREATE POLICY "visualizer_own_insert" ON visualizer_sessions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "visualizer_own_read" ON visualizer_sessions
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_id = current_setting('request.headers', TRUE)::JSON->>'x-session-id'
    OR is_admin()
  );

-- ============================================================
-- AI SEARCH LOGS — Insert public (anonymous logging)
-- ============================================================
CREATE POLICY "ai_logs_public_insert" ON ai_search_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "ai_logs_admin_read" ON ai_search_logs FOR SELECT USING (is_admin());

-- ============================================================
-- PRODUCT VIEWS — Insert public
-- ============================================================
CREATE POLICY "product_views_public_insert" ON product_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "product_views_admin_read" ON product_views FOR SELECT USING (is_admin());

-- ============================================================
-- SEARCH ANALYTICS — Insert public; admin read
-- ============================================================
CREATE POLICY "search_analytics_public_insert" ON search_analytics FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "search_analytics_admin_read" ON search_analytics FOR SELECT USING (is_admin());

-- ============================================================
-- PARTNER APPLICATIONS — Public insert; admin read/update
-- ============================================================
CREATE POLICY "architect_partners_public_insert" ON architect_partners FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "architect_partners_admin_all" ON architect_partners FOR ALL USING (is_admin());

CREATE POLICY "dealer_partners_public_insert" ON dealer_partners FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "dealer_partners_admin_all" ON dealer_partners FOR ALL USING (is_admin());

CREATE POLICY "builder_partners_public_insert" ON builder_partners FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "builder_partners_admin_all" ON builder_partners FOR ALL USING (is_admin());

CREATE POLICY "bulk_inquiries_public_insert" ON bulk_inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "bulk_inquiries_admin_all" ON bulk_inquiries FOR ALL USING (is_admin());

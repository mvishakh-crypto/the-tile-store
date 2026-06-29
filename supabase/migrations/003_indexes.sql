-- ============================================================
-- THE TILE STORE — Performance Indexes
-- Migration: 003_indexes.sql
-- ============================================================

-- ============================================================
-- PRODUCTS — Primary lookup and filter indexes
-- ============================================================

-- Primary lookups
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_code ON products(code);

-- Filter/sort indexes
CREATE INDEX idx_products_category ON products(category_id) WHERE in_stock = TRUE;
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_finish ON products(finish);
CREATE INDEX idx_products_price_category ON products(price_category);
CREATE INDEX idx_products_indoor_outdoor ON products(indoor_outdoor);
CREATE INDEX idx_products_latest ON products(latest DESC) WHERE latest = TRUE;
CREATE INDEX idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Composite: most common collection filter combinations
CREATE INDEX idx_products_cat_finish ON products(category_id, finish);
CREATE INDEX idx_products_cat_price ON products(category_id, price_category);
CREATE INDEX idx_products_brand_cat ON products(brand_id, category_id);

-- Full-text search using GIN index on tsvector
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);

-- Trigram index for fuzzy/LIKE search
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX idx_products_material_trgm ON products USING GIN(material gin_trgm_ops);

-- Array columns
CREATE INDEX idx_products_usage_areas ON products USING GIN(usage_areas);
CREATE INDEX idx_products_features ON products USING GIN(features);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = TRUE;

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- ============================================================
-- PRODUCT TAGS
-- ============================================================
CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE INDEX idx_brands_slug ON brands(slug);

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
CREATE INDEX idx_categories_slug ON product_categories(slug);
CREATE INDEX idx_categories_parent ON product_categories(parent_id);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_session ON wishlist_items(session_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);

-- ============================================================
-- INQUIRY CART
-- ============================================================
CREATE INDEX idx_cart_user ON inquiry_cart(user_id);
CREATE INDEX idx_cart_session ON inquiry_cart(session_id);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_email ON inquiries(email);

-- ============================================================
-- INQUIRY ITEMS
-- ============================================================
CREATE INDEX idx_inquiry_items_inquiry ON inquiry_items(inquiry_id);
CREATE INDEX idx_inquiry_items_product ON inquiry_items(product_id);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);

-- ============================================================
-- BLOGS
-- ============================================================
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published_at DESC) WHERE published = TRUE;
CREATE INDEX idx_blogs_category ON blogs(category_id);
CREATE INDEX idx_blogs_search_vector ON blogs USING GIN(search_vector);
CREATE INDEX idx_blogs_tags ON blogs USING GIN(tags);

-- ============================================================
-- AI / VECTOR
-- ============================================================

-- IVFFlat index for approximate nearest neighbor vector search
-- 100 lists is good for ~10k vectors; increase for larger datasets
CREATE INDEX idx_vector_embeddings_ivfflat ON vector_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Exact HNSW index (higher quality, slower build, faster queries)
CREATE INDEX idx_vector_embeddings_hnsw ON vector_embeddings
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Product views for recommendation analysis
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_session ON product_views(session_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_created ON product_views(viewed_at DESC);

-- AI recommendations
CREATE INDEX idx_ai_recommendations_source ON ai_recommendations(source_product_id);
CREATE INDEX idx_ai_recommendations_score ON ai_recommendations(score DESC);

-- AI search logs
CREATE INDEX idx_ai_search_logs_type ON ai_search_logs(search_type);
CREATE INDEX idx_ai_search_logs_created ON ai_search_logs(created_at DESC);

-- Visualizer sessions
CREATE INDEX idx_visualizer_sessions_session ON visualizer_sessions(session_id);
CREATE INDEX idx_visualizer_sessions_tile ON visualizer_sessions(selected_tile_id);

-- ============================================================
-- BUSINESS TABLES
-- ============================================================
CREATE INDEX idx_architect_partners_status ON architect_partners(status);
CREATE INDEX idx_architect_partners_email ON architect_partners(email);
CREATE INDEX idx_dealer_partners_status ON dealer_partners(status);
CREATE INDEX idx_builder_partners_status ON builder_partners(status);

-- ============================================================
-- SEARCH ANALYTICS
-- ============================================================
CREATE INDEX idx_search_analytics_query ON search_analytics USING GIN(query gin_trgm_ops);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);

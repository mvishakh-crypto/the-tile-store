-- ============================================================
-- THE TILE STORE — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- PostgreSQL / Supabase
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- For accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "vector";      -- pgvector for AI embeddings

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE price_category AS ENUM ('Signature', 'Premium', 'Reserve');
CREATE TYPE product_finish AS ENUM ('Polished', 'Matte', 'Satin', 'High-Gloss', 'Structured', 'Lappato');
CREATE TYPE indoor_outdoor_type AS ENUM ('indoor', 'outdoor', 'both');
CREATE TYPE user_role AS ENUM ('customer', 'architect', 'builder', 'dealer', 'admin');
CREATE TYPE inquiry_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE search_type AS ENUM ('text', 'image', 'filter');
CREATE TYPE bulk_inquiry_status AS ENUM ('pending', 'quoted', 'converted', 'lost');

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  highlights  TEXT[] DEFAULT '{}',
  country     TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE product_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (core table)
-- ============================================================
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  code              TEXT NOT NULL UNIQUE,
  slug              TEXT NOT NULL UNIQUE,
  category_id       UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  material          TEXT NOT NULL,
  finish            product_finish NOT NULL,
  size              TEXT NOT NULL,
  origin            TEXT NOT NULL,
  price_category    price_category NOT NULL DEFAULT 'Premium',
  description       TEXT NOT NULL,
  features          TEXT[] DEFAULT '{}',
  color             TEXT,
  texture           TEXT,
  anti_skid         BOOLEAN NOT NULL DEFAULT FALSE,
  usage_areas       TEXT[] DEFAULT '{}',
  shape             TEXT,
  thickness         TEXT,
  water_absorption  TEXT,
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  style             TEXT,
  indoor_outdoor    indoor_outdoor_type,
  texture_category  TEXT,
  latest            BOOLEAN NOT NULL DEFAULT FALSE,
  popularity_score  INT NOT NULL DEFAULT 0,
  in_stock          BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity    INT,
  weight_gsm        NUMERIC(10, 2),
  -- Full-text search vector (auto-updated by trigger)
  search_vector     TSVECTOR,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE product_variants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  size             TEXT NOT NULL,
  finish           product_finish NOT NULL,
  price_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  in_stock         BOOLEAN NOT NULL DEFAULT TRUE,
  sku              TEXT NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0,
  storage_path  TEXT,  -- Supabase Storage relative path
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT TAGS
-- ============================================================
CREATE TABLE product_tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  UNIQUE(product_id, tag)
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'customer',
  company     TEXT,
  gst_number  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label      TEXT NOT NULL DEFAULT 'Home',
  line1      TEXT NOT NULL,
  line2      TEXT,
  city       TEXT NOT NULL,
  state      TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  country    TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE user_preferences (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_styles   TEXT[] DEFAULT '{}',
  preferred_colors   TEXT[] DEFAULT '{}',
  preferred_finishes TEXT[] DEFAULT '{}',
  room_types         TEXT[] DEFAULT '{}',
  budget_category    price_category,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT,   -- for anonymous users
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ============================================================
-- COMPARE ITEMS
-- ============================================================
CREATE TABLE compare_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ============================================================
-- INQUIRY CART (server-side, syncs with localStorage)
-- ============================================================
CREATE TABLE inquiry_cart (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ============================================================
-- INQUIRIES (submitted inquiry orders)
-- ============================================================
CREATE TABLE inquiries (
  id                TEXT PRIMARY KEY DEFAULT 'TTS-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  reference_number  TEXT NOT NULL UNIQUE DEFAULT 'TTS-' || LPAD(FLOOR(RANDOM() * 999999 + 100000)::TEXT, 6, '0'),
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id        TEXT,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  company           TEXT,
  project_type      TEXT,
  message           TEXT,
  status            inquiry_status NOT NULL DEFAULT 'pending',
  total_area_sqft   NUMERIC(12, 2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INQUIRY ITEMS
-- ============================================================
CREATE TABLE inquiry_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id  TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INT NOT NULL DEFAULT 1,
  area_sqft   NUMERIC(12, 2),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONSULTATION BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  booking_date  DATE NOT NULL,
  booking_time  TEXT NOT NULL,
  project_type  TEXT,
  location      TEXT,
  budget_range  TEXT,
  notes         TEXT,
  status        booking_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MOODBOARDS
-- ============================================================
CREATE TABLE moodboards (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id     TEXT,
  name           TEXT NOT NULL DEFAULT 'My Moodboard',
  description    TEXT,
  thumbnail_url  TEXT,
  is_public      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE moodboard_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moodboard_id  UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position_x    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  position_y    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  scale         NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  rotation      NUMERIC(7, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SAVED COLLECTIONS
-- ============================================================
CREATE TABLE saved_collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  product_ids UUID[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BLOGS
-- ============================================================
CREATE TABLE blog_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blogs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT,
  content       TEXT NOT NULL,
  cover_image   TEXT,
  category_id   UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL,
  author_avatar TEXT,
  read_time     INT,  -- minutes
  tags          TEXT[] DEFAULT '{}',
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  view_count    INT NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE testimonials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name   TEXT NOT NULL,
  role          TEXT NOT NULL,
  company       TEXT,
  quote         TEXT NOT NULL,
  rating        INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url    TEXT,
  project_type  TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INSPIRATIONS
-- ============================================================
CREATE TABLE inspirations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  category    TEXT NOT NULL,
  room_type   TEXT,
  style       TEXT,
  product_ids UUID[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECT GALLERIES
-- ============================================================
CREATE TABLE galleries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  subtitle     TEXT,
  category     TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  location     TEXT,
  size         TEXT,
  year         TEXT,
  description  TEXT,
  room_type    TEXT,
  style        TEXT,
  product_ids  UUID[] DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AI SYSTEMS
-- ============================================================

-- Vector embeddings for AI image search (CLIP-compatible, 768-dim)
CREATE TABLE vector_embeddings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  embedding      vector(768),   -- pgvector 768-dimensional embedding
  model_version  TEXT NOT NULL DEFAULT 'gemini-embedding-001',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Space visualizer sessions
CREATE TABLE visualizer_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id        TEXT,
  room_image_url    TEXT,
  room_type         TEXT NOT NULL,
  selected_tile_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  result_image_url  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI search analytics log
CREATE TABLE ai_search_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id       TEXT,
  search_type      search_type NOT NULL DEFAULT 'text',
  query            TEXT,
  image_url        TEXT,
  result_count     INT NOT NULL DEFAULT 0,
  top_result_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-computed recommendation pairs
CREATE TABLE ai_recommendations (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  score                    NUMERIC(5, 4) NOT NULL DEFAULT 0,
  reason                   TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_product_id, recommended_product_id)
);

-- Product view tracking (behavioral data for recommendations)
CREATE TABLE product_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id  TEXT,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUSINESS TABLES
-- ============================================================

CREATE TABLE architect_partners (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  firm_name           TEXT NOT NULL,
  city                TEXT NOT NULL,
  portfolio_url       TEXT,
  project_type        TEXT,
  annual_volume_sqft  TEXT,
  message             TEXT,
  status              partner_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dealer_partners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  company_name    TEXT NOT NULL,
  city            TEXT NOT NULL,
  current_brands  TEXT,
  showroom_size   TEXT,
  message         TEXT,
  status          partner_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE builder_partners (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                        TEXT NOT NULL,
  email                       TEXT NOT NULL,
  phone                       TEXT NOT NULL,
  company_name                TEXT NOT NULL,
  city                        TEXT NOT NULL,
  project_types               TEXT[] DEFAULT '{}',
  annual_requirements_sqft    TEXT,
  message                     TEXT,
  status                      partner_status NOT NULL DEFAULT 'pending',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bulk_inquiries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  company       TEXT,
  project_name  TEXT,
  volume_sqft   NUMERIC(12, 2),
  timeline      TEXT,
  product_ids   UUID[] DEFAULT '{}',
  message       TEXT,
  status        bulk_inquiry_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEARCH ANALYTICS
-- ============================================================
CREATE TABLE search_analytics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query               TEXT NOT NULL,
  result_count        INT NOT NULL DEFAULT 0,
  clicked_product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  session_id          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VIEWS — Denormalized views for efficient queries
-- ============================================================

-- Products with all related data joined
CREATE OR REPLACE VIEW products_with_details AS
SELECT
  p.id,
  p.name,
  p.code,
  p.slug,
  p.material,
  p.finish::TEXT,
  p.size,
  p.origin,
  p.price_category::TEXT,
  p.description,
  p.features,
  p.color,
  p.texture,
  p.anti_skid,
  p.usage_areas,
  p.shape,
  p.thickness,
  p.water_absorption,
  p.style,
  p.indoor_outdoor::TEXT,
  p.texture_category,
  p.latest,
  p.popularity_score,
  p.in_stock,
  p.created_at,
  pc.name AS category_name,
  pc.slug AS category_slug,
  b.name AS brand_name,
  b.slug AS brand_slug,
  pi.url AS primary_image_url
FROM
  products p
  LEFT JOIN product_categories pc ON pc.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'products', 'profiles', 'user_preferences', 'inquiry_cart',
    'inquiries', 'bookings', 'moodboards', 'blogs',
    'architect_partners', 'dealer_partners', 'builder_partners',
    'bulk_inquiries', 'vector_embeddings'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl
    );
  END LOOP;
END $$;

-- Auto-update product full-text search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.name, '')), 'A') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.material, '')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.description, '')), 'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.color, '')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.texture, '')), 'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.style, '')), 'C') ||
    SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.usage_areas, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Auto-update blog full-text search vector
CREATE OR REPLACE FUNCTION update_blog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.title, '')), 'A') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.excerpt, '')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_search_vector
  BEFORE INSERT OR UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_blog_search_vector();

-- Auto-create profile on Supabase auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STORED FUNCTIONS
-- ============================================================

-- Full-text product search with trigram fallback
CREATE OR REPLACE FUNCTION search_products_fts(
  search_query TEXT,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  similarity  REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    TS_RANK(p.search_vector, query) AS similarity
  FROM
    products p,
    PLAINTO_TSQUERY('english', search_query) query
  WHERE
    p.search_vector @@ query
    OR SIMILARITY(p.name, search_query) > 0.2
    OR SIMILARITY(p.material, search_query) > 0.2
  ORDER BY similarity DESC, p.popularity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get similar products based on multi-signal scoring
CREATE OR REPLACE FUNCTION get_similar_products(
  product_id UUID,
  limit_count INT DEFAULT 6
)
RETURNS TABLE (
  id      UUID,
  name    TEXT,
  score   NUMERIC,
  reason  TEXT
) AS $$
DECLARE
  source products%ROWTYPE;
BEGIN
  SELECT * INTO source FROM products WHERE products.id = product_id;

  RETURN QUERY
  WITH scored AS (
    SELECT
      p.id,
      p.name,
      (
        CASE WHEN p.category_id = source.category_id THEN 0.3 ELSE 0 END +
        CASE WHEN p.style = source.style THEN 0.2 ELSE 0 END +
        CASE WHEN p.color = source.color THEN 0.2 ELSE 0 END +
        CASE WHEN p.texture_category = source.texture_category THEN 0.15 ELSE 0 END +
        CASE WHEN p.finish = source.finish THEN 0.1 ELSE 0 END +
        (p.popularity_score::NUMERIC / 1000.0) * 0.05
      )::NUMERIC(5, 4) AS score,
      CASE
        WHEN p.category_id = source.category_id AND p.style = source.style
          THEN 'Same category and style'
        WHEN p.category_id = source.category_id
          THEN 'Same category'
        WHEN p.color = source.color AND p.style = source.style
          THEN 'Similar color and style'
        ELSE 'Related design'
      END AS reason
    FROM products p
    WHERE p.id != product_id AND p.in_stock = TRUE
  )
  SELECT s.id, s.name, s.score, s.reason
  FROM scored s
  WHERE s.score > 0.1
  ORDER BY s.score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Vector similarity search for AI image search
CREATE OR REPLACE FUNCTION search_by_embedding(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT DEFAULT 10
)
RETURNS TABLE (
  product_id  UUID,
  similarity  FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.product_id,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM vector_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Get popular search terms (last 30 days, min 3 occurrences)
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INT DEFAULT 10)
RETURNS TABLE (
  query TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.query, COUNT(*)::BIGINT AS count
  FROM search_analytics sa
  WHERE sa.created_at > NOW() - INTERVAL '30 days'
  GROUP BY sa.query
  HAVING COUNT(*) >= 3
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

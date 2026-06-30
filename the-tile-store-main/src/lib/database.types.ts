// ============================================================
// Database Types — Auto-generated from Supabase schema
// Represents all tables, views, and enums in the PostgreSQL DB
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // --------------------------------------------------------
      // PRODUCTS
      // --------------------------------------------------------
      products: {
        Row: {
          id: string;
          name: string;
          code: string;
          slug: string;
          category_id: string;
          material: string;
          finish: string;
          size: string;
          origin: string;
          price_category: 'Signature' | 'Premium' | 'Reserve';
          description: string;
          features: string[];
          color: string | null;
          texture: string | null;
          anti_skid: boolean;
          usage_areas: string[];
          shape: string | null;
          thickness: string | null;
          water_absorption: string | null;
          brand_id: string | null;
          style: string | null;
          indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null;
          texture_category: string | null;
          latest: boolean;
          popularity_score: number;
          in_stock: boolean;
          stock_quantity: number | null;
          weight_gsm: number | null;
          created_at: string;
          updated_at: string;
          metadata: Json | null;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };

      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          size: string;
          finish: string;
          price_multiplier: number;
          in_stock: boolean;
          sku: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };

      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
          storage_path: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>;
      };

      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_categories']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>;
      };

      product_tags: {
        Row: {
          id: string;
          product_id: string;
          tag: string;
        };
        Insert: Omit<Database['public']['Tables']['product_tags']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['product_tags']['Insert']>;
      };

      // --------------------------------------------------------
      // BRANDS
      // --------------------------------------------------------
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          description: string | null;
          highlights: string[];
          country: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['brands']['Insert']>;
      };

      // --------------------------------------------------------
      // USERS & PROFILES
      // --------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'architect' | 'builder' | 'dealer' | 'admin';
          company: string | null;
          gst_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
      };

      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_styles: string[];
          preferred_colors: string[];
          preferred_finishes: string[];
          room_types: string[];
          budget_category: 'Signature' | 'Premium' | 'Reserve' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_preferences']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>;
      };

      // --------------------------------------------------------
      // ECOMMERCE
      // --------------------------------------------------------
      wishlist_items: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['wishlist_items']['Insert']>;
      };

      compare_items: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['compare_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['compare_items']['Insert']>;
      };

      inquiry_cart: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          quantity: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inquiry_cart']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['inquiry_cart']['Insert']>;
      };

      inquiries: {
        Row: {
          id: string;
          reference_number: string;
          user_id: string | null;
          session_id: string | null;
          name: string;
          email: string;
          phone: string;
          company: string | null;
          project_type: string | null;
          message: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          total_area_sqft: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'reference_number' | 'created_at' | 'updated_at'> & { id?: string; reference_number?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
      };

      inquiry_items: {
        Row: {
          id: string;
          inquiry_id: string;
          product_id: string;
          quantity: number;
          area_sqft: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inquiry_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['inquiry_items']['Insert']>;
      };

      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          booking_date: string;
          booking_time: string;
          project_type: string | null;
          location: string | null;
          budget_range: string | null;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };

      moodboards: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          name: string;
          description: string | null;
          thumbnail_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['moodboards']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['moodboards']['Insert']>;
      };

      moodboard_items: {
        Row: {
          id: string;
          moodboard_id: string;
          product_id: string;
          position_x: number;
          position_y: number;
          scale: number;
          rotation: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['moodboard_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['moodboard_items']['Insert']>;
      };

      saved_collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          product_ids: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_collections']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['saved_collections']['Insert']>;
      };

      // --------------------------------------------------------
      // CONTENT
      // --------------------------------------------------------
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image: string | null;
          category_id: string | null;
          author_name: string;
          author_avatar: string | null;
          read_time: number | null;
          tags: string[];
          published: boolean;
          published_at: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'> & { id?: string; created_at?: string; updated_at?: string; view_count?: number };
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>;
      };

      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_categories']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['blog_categories']['Insert']>;
      };

      testimonials: {
        Row: {
          id: string;
          client_name: string;
          role: string;
          company: string | null;
          quote: string;
          rating: number;
          avatar_url: string | null;
          project_type: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>;
      };

      inspirations: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          category: string;
          room_type: string | null;
          style: string | null;
          product_ids: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inspirations']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['inspirations']['Insert']>;
      };

      galleries: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          category: string;
          image_url: string;
          location: string | null;
          size: string | null;
          year: string | null;
          description: string | null;
          room_type: string | null;
          style: string | null;
          product_ids: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['galleries']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['galleries']['Insert']>;
      };

      // --------------------------------------------------------
      // AI SYSTEMS
      // --------------------------------------------------------
      vector_embeddings: {
        Row: {
          id: string;
          product_id: string;
          embedding: number[];
          model_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vector_embeddings']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['vector_embeddings']['Insert']>;
      };

      visualizer_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          room_image_url: string | null;
          room_type: string;
          selected_tile_id: string | null;
          result_image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['visualizer_sessions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['visualizer_sessions']['Insert']>;
      };

      ai_search_logs: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          search_type: 'text' | 'image' | 'filter';
          query: string | null;
          image_url: string | null;
          result_count: number;
          top_result_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_search_logs']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['ai_search_logs']['Insert']>;
      };

      ai_recommendations: {
        Row: {
          id: string;
          source_product_id: string;
          recommended_product_id: string;
          score: number;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_recommendations']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['ai_recommendations']['Insert']>;
      };

      product_views: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          viewed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_views']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['product_views']['Insert']>;
      };

      // --------------------------------------------------------
      // BUSINESS
      // --------------------------------------------------------
      architect_partners: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          firm_name: string;
          city: string;
          portfolio_url: string | null;
          project_type: string | null;
          annual_volume_sqft: string | null;
          message: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['architect_partners']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['architect_partners']['Insert']>;
      };

      dealer_partners: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company_name: string;
          city: string;
          current_brands: string | null;
          showroom_size: string | null;
          message: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dealer_partners']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['dealer_partners']['Insert']>;
      };

      builder_partners: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company_name: string;
          city: string;
          project_types: string[];
          annual_requirements_sqft: string | null;
          message: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['builder_partners']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['builder_partners']['Insert']>;
      };

      bulk_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company: string | null;
          project_name: string | null;
          volume_sqft: number | null;
          timeline: string | null;
          product_ids: string[];
          message: string | null;
          status: 'pending' | 'quoted' | 'converted' | 'lost';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bulk_inquiries']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['bulk_inquiries']['Insert']>;
      };

      search_analytics: {
        Row: {
          id: string;
          query: string;
          result_count: number;
          clicked_product_id: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['search_analytics']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['search_analytics']['Insert']>;
      };
    };

    Views: {
      products_with_details: {
        Row: {
          id: string;
          name: string;
          code: string;
          slug: string;
          category_name: string;
          brand_name: string | null;
          material: string;
          finish: string;
          size: string;
          origin: string;
          price_category: 'Signature' | 'Premium' | 'Reserve';
          description: string;
          primary_image_url: string | null;
          popularity_score: number;
          in_stock: boolean;
          latest: boolean;
          created_at: string;
        };
      };
    };

    Functions: {
      search_products_fts: {
        Args: { search_query: string; limit_count?: number };
        Returns: Array<{ id: string; name: string; similarity: number }>;
      };
      get_similar_products: {
        Args: { product_id: string; limit_count?: number };
        Returns: Array<{ id: string; name: string; score: number; reason: string }>;
      };
    };

    Enums: {
      price_category: 'Signature' | 'Premium' | 'Reserve';
      product_finish: 'Polished' | 'Matte' | 'Satin' | 'High-Gloss' | 'Structured' | 'Lappato';
      indoor_outdoor: 'indoor' | 'outdoor' | 'both';
      user_role: 'customer' | 'architect' | 'builder' | 'dealer' | 'admin';
      inquiry_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
      partner_status: 'pending' | 'approved' | 'rejected';
    };
  };
}

// ============================================================
// Helper type aliases for convenience
// ============================================================
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// ============================================================
// Specific type exports used across the app
// ============================================================
export type Product = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type ProductCategory = Tables<'product_categories'>;
export type Brand = Tables<'brands'>;
export type Profile = Tables<'profiles'>;
export type WishlistItem = Tables<'wishlist_items'>;
export type InquiryCartItem = Tables<'inquiry_cart'>;
export type Inquiry = Tables<'inquiries'>;
export type Booking = Tables<'bookings'>;
export type Moodboard = Tables<'moodboards'>;
export type Blog = Tables<'blogs'>;
export type Gallery = Tables<'galleries'>;
export type Testimonial = Tables<'testimonials'>;
export type VectorEmbedding = Tables<'vector_embeddings'>;
export type VisualizerSession = Tables<'visualizer_sessions'>;
export type AiSearchLog = Tables<'ai_search_logs'>;
export type ArchitectPartner = Tables<'architect_partners'>;
export type DealerPartner = Tables<'dealer_partners'>;
export type BulkInquiry = Tables<'bulk_inquiries'>;

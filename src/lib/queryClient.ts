// ============================================================
// React Query Client — optimized caching for luxury tile store
// ============================================================
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Products and catalog data: fresh for 5 min, cached for 30 min
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'code' in error) {
          const code = (error as { code: string }).code;
          if (['PGRST116', 'NOT_FOUND', '400', '401', '403'].includes(code)) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================
// Query Key factory — structured, typed cache keys
// ============================================================
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    trending: () => [...queryKeys.products.all, 'trending'] as const,
    latest: () => [...queryKeys.products.all, 'latest'] as const,
    related: (id: string) => [...queryKeys.products.all, 'related', id] as const,
    byCategory: (category: string) => [...queryKeys.products.all, 'category', category] as const,
  },

  // Brands
  brands: {
    all: ['brands'] as const,
    list: () => [...queryKeys.brands.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.brands.all, id] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    results: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.search.all, 'results', query, filters] as const,
    suggestions: (partial: string) =>
      [...queryKeys.search.all, 'suggestions', partial] as const,
    popular: () => [...queryKeys.search.all, 'popular'] as const,
    recent: (sessionId: string) =>
      [...queryKeys.search.all, 'recent', sessionId] as const,
  },

  // Wishlist
  wishlist: {
    all: ['wishlist'] as const,
    byUser: (userId: string) => [...queryKeys.wishlist.all, userId] as const,
    bySession: (sessionId: string) => [...queryKeys.wishlist.all, 'session', sessionId] as const,
  },

  // Cart
  inquiryCart: {
    all: ['inquiry-cart'] as const,
    bySession: (sessionId: string) => [...queryKeys.inquiryCart.all, sessionId] as const,
  },

  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    forProduct: (id: string) => [...queryKeys.recommendations.all, 'product', id] as const,
    forRoom: (roomType: string) => [...queryKeys.recommendations.all, 'room', roomType] as const,
  },

  // Blogs
  blogs: {
    all: ['blogs'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.blogs.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.blogs.all, id] as const,
    byCategory: (category: string) => [...queryKeys.blogs.all, 'category', category] as const,
  },

  // Testimonials
  testimonials: {
    all: ['testimonials'] as const,
    featured: () => [...queryKeys.testimonials.all, 'featured'] as const,
  },

  // Galleries
  galleries: {
    all: ['galleries'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.galleries.all, 'list', filters] as const,
  },

  // Bookings
  bookings: {
    all: ['bookings'] as const,
    availableSlots: (date: string) => [...queryKeys.bookings.all, 'slots', date] as const,
  },

  // AI
  ai: {
    all: ['ai'] as const,
    imageSearch: (imageHash: string) => [...queryKeys.ai.all, 'image-search', imageHash] as const,
    visualizerSession: (sessionId: string) =>
      [...queryKeys.ai.all, 'visualizer', sessionId] as const,
  },
} as const;

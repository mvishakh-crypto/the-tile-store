// ============================================================
// useProducts — React Query hooks for the product catalog
// ============================================================
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getLatestProducts,
  getRelatedProducts,
  getProductsByCategory,
  getBrands,
  getCategories,
  type ProductFilters,
  type SortOption,
} from '../services/productService';

// ============================================================
// PRODUCTS LIST
// ============================================================
export function useProducts(
  filters: ProductFilters = {},
  sort: SortOption = { field: 'popularity_score', direction: 'desc' },
  page = 1,
  pageSize = 20
) {
  return useQuery({
    queryKey: queryKeys.products.list({ ...filters, sort, page, pageSize }),
    queryFn: () => getProducts(filters, sort, page, pageSize),
    placeholderData: (prev) => prev, // Keep previous data while fetching new page
  });
}

// ============================================================
// INFINITE SCROLL PRODUCTS
// ============================================================
export function useInfiniteProducts(
  filters: ProductFilters = {},
  sort: SortOption = { field: 'popularity_score', direction: 'desc' },
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list({ ...filters, sort, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      getProducts(filters, sort, pageParam as number, pageSize),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// ============================================================
// SINGLE PRODUCT
// ============================================================
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes — product pages change rarely
  });
}

// ============================================================
// FEATURED PRODUCTS (homepage)
// ============================================================
export function useFeaturedProducts(limit = 6) {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// ============================================================
// LATEST PRODUCTS
// ============================================================
export function useLatestProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.latest(),
    queryFn: () => getLatestProducts(limit),
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================
// RELATED PRODUCTS (product detail page)
// ============================================================
export function useRelatedProducts(productId: string, limit = 6) {
  return useQuery({
    queryKey: queryKeys.products.related(productId),
    queryFn: () => getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 15 * 60 * 1000,
  });
}

// ============================================================
// PRODUCTS BY CATEGORY
// ============================================================
export function useProductsByCategory(category: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(category),
    queryFn: () => getProductsByCategory(category, limit),
    enabled: !!category,
  });
}

// ============================================================
// BRANDS
// ============================================================
export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands.list(),
    queryFn: getBrands,
    staleTime: 30 * 60 * 1000, // Brands change rarely
  });
}

// ============================================================
// CATEGORIES
// ============================================================
export function useCategories() {
  return useQuery({
    queryKey: [...queryKeys.products.all, 'categories'] as const,
    queryFn: getCategories,
    staleTime: 60 * 60 * 1000, // Categories change very rarely
  });
}

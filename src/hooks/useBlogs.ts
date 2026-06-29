import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getBlogs, getBlogById, getBlogCategories } from '../services/blogService';

// Returned shape: { blogs: BlogArticle[], total: number }
export function useBlogs(filters?: { categoryId?: string; tag?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: queryKeys.blogs.list(filters),
    queryFn: () => getBlogs(filters),
    placeholderData: (prev) => prev,
  });
}

export function useBlogArticle(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(idOrSlug),
    queryFn: () => getBlogById(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: [...queryKeys.blogs.all, 'categories'] as const,
    queryFn: getBlogCategories,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

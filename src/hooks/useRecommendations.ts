// ============================================================
// useRecommendations — AI-powered recommendation hooks
// ============================================================
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '../lib/queryClient';
import {
  getProductRecommendations,
  getRecommendationsByRoom,
  getPersonalizedRecommendations,
  logProductView,
} from '../services/recommendationService';

/**
 * Get AI recommendations for a specific product.
 * Also logs a product view for behavioral analytics.
 */
export function useProductRecommendations(productId: string, limit = 6) {
  // Log product view on mount (behavioral tracking for future recommendations)
  useEffect(() => {
    if (productId) {
      void logProductView(productId);
    }
  }, [productId]);

  return useQuery({
    queryKey: queryKeys.recommendations.forProduct(productId),
    queryFn: () => getProductRecommendations(productId, limit),
    enabled: !!productId,
    staleTime: 20 * 60 * 1000, // Recommendations are stable
  });
}

/**
 * Get trending tiles recommended for a specific room type.
 */
export function useRoomRecommendations(roomType: string, limit = 8) {
  return useQuery({
    queryKey: queryKeys.recommendations.forRoom(roomType),
    queryFn: () => getRecommendationsByRoom(roomType, limit),
    enabled: !!roomType,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Get personalized recommendations based on viewing history.
 */
export function usePersonalizedRecommendations(limit = 8) {
  return useQuery({
    queryKey: [...queryKeys.recommendations.all, 'personalized'] as const,
    queryFn: () => getPersonalizedRecommendations(limit),
    staleTime: 5 * 60 * 1000,
  });
}

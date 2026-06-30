// ============================================================
// useWishlist — DB-backed wishlist hook with localStorage sync
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  addToWishlist,
  removeFromWishlist,
  syncWishlistToUser,
} from '../services/wishlistService';
import type { TileProduct } from '../types';

const WISHLIST_STORAGE_KEY = 'atelier-wishlist';

function loadLocalWishlist(): TileProduct[] {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: TileProduct[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silent fail
  }
}

// ============================================================
// MAIN WISHLIST HOOK
// Designed as a drop-in replacement for the existing App.tsx wishlist state.
// The hook manages localStorage directly for instant UI response,
// and syncs to the DB in the background when Supabase is configured.
// ============================================================
export function useWishlist(userId?: string | null) {
  const queryClient = useQueryClient();

  // Initialize from localStorage for instant load
  const [wishlist, setWishlist] = useState<TileProduct[]>(() => loadLocalWishlist());

  // Sync to localStorage on every change
  useEffect(() => {
    saveLocalWishlist(wishlist);
  }, [wishlist]);

  // Add mutation — updates localStorage + DB
  const addMutation = useMutation({
    mutationFn: (product: TileProduct) => addToWishlist(product, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });

  const handleAddToWishlist = useCallback((product: TileProduct) => {
    if (wishlist.some(item => item.id === product.id)) return;

    // Optimistic update
    setWishlist(prev => [...prev, product]);

    // Background sync to DB
    addMutation.mutate(product);
  }, [wishlist, addMutation]);

  const handleRemoveFromWishlist = useCallback((productId: string) => {
    // Optimistic update
    setWishlist(prev => prev.filter(item => item.id !== productId));

    // Background sync to DB
    removeMutation.mutate(productId);
  }, [removeMutation]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  const handleSyncToUser = useCallback(async (newUserId: string) => {
    await syncWishlistToUser(newUserId);
  }, []);

  return {
    wishlist,
    wishlistCount: wishlist.length,
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    isInWishlist,
    syncToUser: handleSyncToUser,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

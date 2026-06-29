// @ts-nocheck
// ============================================================
// useRecentlyViewed — Track recently viewed tiles per session
// localStorage-first with optional Supabase sync
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSessionId } from '../lib/supabase';
import type { TileProduct } from '../types';

const STORAGE_KEY = 'atelier-recently-viewed';
const MAX_ITEMS = 10;

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function loadFromStorage(): TileProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TileProduct[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: TileProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage quota exceeded — silent fail
  }
}

// ============================================================
// SUPABASE SYNC (fire-and-forget, non-blocking)
// ============================================================

async function logViewToSupabase(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const sessionId = getSessionId();
    // Upsert: update viewed_at if already viewed this session
    await supabase
      .from('recently_viewed' as never)
      .upsert(
        { session_id: sessionId, product_id: productId },
        { onConflict: 'session_id,product_id' }
      );
  } catch {
    // Non-critical — never block UI
  }
}

// ============================================================
// HOOK
// ============================================================

export interface UseRecentlyViewedReturn {
  recentlyViewed: TileProduct[];
  addToRecent: (tile: TileProduct) => void;
  removeFromRecent: (tileId: string) => void;
  clearRecent: () => void;
  isRecentlyViewed: (tileId: string) => boolean;
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [recentlyViewed, setRecentlyViewed] = useState<TileProduct[]>(() =>
    loadFromStorage()
  );

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(recentlyViewed);
  }, [recentlyViewed]);

  /**
   * Add or move a tile to the front of the recently viewed list.
   */
  const addToRecent = useCallback((tile: TileProduct) => {
    setRecentlyViewed((prev) => {
      // Remove if already present (move to front)
      const filtered = prev.filter((p) => p.id !== tile.id);
      const updated = [tile, ...filtered].slice(0, MAX_ITEMS);
      return updated;
    });

    // Async DB log (fire-and-forget)
    void logViewToSupabase(tile.id);
  }, []);

  const removeFromRecent = useCallback((tileId: string) => {
    setRecentlyViewed((prev) => prev.filter((p) => p.id !== tileId));
  }, []);

  const clearRecent = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
  }, []);

  const isRecentlyViewed = useCallback(
    (tileId: string) => recentlyViewed.some((p) => p.id === tileId),
    [recentlyViewed]
  );

  return {
    recentlyViewed,
    addToRecent,
    removeFromRecent,
    clearRecent,
    isRecentlyViewed,
  };
}

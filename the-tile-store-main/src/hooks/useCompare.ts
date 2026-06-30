// @ts-nocheck
// ============================================================
// useCompare — DB-persisted product comparison (up to 3 tiles)
// Mirrors useWishlist pattern: localStorage + Supabase sync
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSessionId } from '../lib/supabase';
import type { TileProduct } from '../types';

const STORAGE_KEY = 'atelier-compare-items';
const MAX_COMPARE = 3;

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
  } catch {}
}

// ============================================================
// SUPABASE SYNC HELPERS
// ============================================================

async function syncAddToDb(productId: string, userId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const sessionId = getSessionId();
    await supabase.from('compare_items').upsert(
      { product_id: productId, session_id: userId ? null : sessionId, user_id: userId || null },
      { onConflict: userId ? 'user_id,product_id' : 'session_id,product_id' }
    );
  } catch {}
}

async function syncRemoveFromDb(productId: string, userId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const sessionId = getSessionId();
    let query = supabase.from('compare_items').delete().eq('product_id', productId);
    if (userId) query = query.eq('user_id', userId);
    else query = query.eq('session_id', sessionId);
    await query;
  } catch {}
}

// ============================================================
// HOOK
// ============================================================

export interface UseCompareReturn {
  compareItems: TileProduct[];
  addToCompare: (tile: TileProduct) => boolean; // returns false if already 3 items
  removeFromCompare: (tileId: string) => void;
  clearCompare: () => void;
  isInCompare: (tileId: string) => boolean;
  compareCount: number;
  canAddMore: boolean;
}

export function useCompare(userId?: string): UseCompareReturn {
  const [compareItems, setCompareItems] = useState<TileProduct[]>(() =>
    loadFromStorage()
  );

  useEffect(() => {
    saveToStorage(compareItems);
  }, [compareItems]);

  const addToCompare = useCallback(
    (tile: TileProduct): boolean => {
      let added = false;
      setCompareItems((prev) => {
        if (prev.length >= MAX_COMPARE || prev.some((p) => p.id === tile.id)) {
          return prev;
        }
        added = true;
        return [...prev, tile];
      });
      if (added) void syncAddToDb(tile.id, userId);
      return added;
    },
    [userId]
  );

  const removeFromCompare = useCallback(
    (tileId: string) => {
      setCompareItems((prev) => prev.filter((p) => p.id !== tileId));
      void syncRemoveFromDb(tileId, userId);
    },
    [userId]
  );

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const isInCompare = useCallback(
    (tileId: string) => compareItems.some((p) => p.id === tileId),
    [compareItems]
  );

  return {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount: compareItems.length,
    canAddMore: compareItems.length < MAX_COMPARE,
  };
}

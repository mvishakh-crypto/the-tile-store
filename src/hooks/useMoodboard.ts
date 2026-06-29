// @ts-nocheck
// ============================================================
// useMoodboard — DB-persisted moodboard CRUD
// localStorage for anonymous users, Supabase for auth users
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSessionId } from '../lib/supabase';
import type { TileProduct } from '../types';

const STORAGE_KEY = 'atelier-moodboards';

// ============================================================
// TYPES
// ============================================================

export interface MoodboardItem {
  id: string;
  productId: string;
  product: TileProduct;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
}

export interface Moodboard {
  id: string;
  name: string;
  description?: string;
  items: MoodboardItem[];
  thumbnailUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UseMoodboardReturn {
  moodboards: Moodboard[];
  activeMoodboard: Moodboard | null;
  isLoading: boolean;
  createMoodboard: (name: string, description?: string) => Promise<Moodboard>;
  deleteMoodboard: (id: string) => Promise<void>;
  setActiveMoodboard: (id: string) => void;
  addItemToBoard: (boardId: string, tile: TileProduct, position?: { x: number; y: number }) => Promise<void>;
  removeItemFromBoard: (boardId: string, itemId: string) => Promise<void>;
  updateItemPosition: (boardId: string, itemId: string, positionX: number, positionY: number, scale?: number, rotation?: number) => void;
  renameMoodboard: (id: string, name: string) => Promise<void>;
  saveThumbnail: (boardId: string, thumbnailUrl: string) => Promise<void>;
}

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function loadFromStorage(): Moodboard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Moodboard[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(boards: Moodboard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch {}
}

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

// ============================================================
// SUPABASE HELPERS
// ============================================================

async function dbCreateMoodboard(name: string, description: string | undefined, userId?: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('moodboards')
      .insert({
        name,
        description: description || null,
        user_id: userId || null,
        session_id: userId ? null : sessionId,
        is_public: false,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

async function dbAddMoodboardItem(moodboardId: string, productId: string, positionX: number, positionY: number): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('moodboard_items')
      .insert({
        moodboard_id: moodboardId,
        product_id: productId,
        position_x: positionX,
        position_y: positionY,
        scale: 1.0,
        rotation: 0,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

async function dbRemoveMoodboardItem(itemId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('moodboard_items').delete().eq('id', itemId);
  } catch {}
}

async function dbDeleteMoodboard(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('moodboards').delete().eq('id', id);
  } catch {}
}

async function dbRenameMoodboard(id: string, name: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('moodboards').update({ name }).eq('id', id);
  } catch {}
}

async function dbSaveThumbnail(id: string, thumbnailUrl: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('moodboards').update({ thumbnail_url: thumbnailUrl }).eq('id', id);
  } catch {}
}

// ============================================================
// HOOK
// ============================================================

export function useMoodboard(userId?: string): UseMoodboardReturn {
  const [moodboards, setMoodboards] = useState<Moodboard[]>(() => loadFromStorage());
  const [activeMoodboardId, setActiveMoodboardId] = useState<string | null>(
    () => loadFromStorage()[0]?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(moodboards);
  }, [moodboards]);

  const activeMoodboard = moodboards.find((b) => b.id === activeMoodboardId) ?? null;

  // ── CREATE ─────────────────────────────────────────────────
  const createMoodboard = useCallback(
    async (name: string, description?: string): Promise<Moodboard> => {
      const now = new Date().toISOString();

      // Create in DB if configured, get real ID
      const dbId = await dbCreateMoodboard(name, description, userId);
      const id = dbId || generateId();

      const newBoard: Moodboard = {
        id,
        name,
        description,
        items: [],
        isPublic: false,
        createdAt: now,
        updatedAt: now,
      };

      setMoodboards((prev) => [newBoard, ...prev]);
      setActiveMoodboardId(id);
      return newBoard;
    },
    [userId]
  );

  // ── DELETE ─────────────────────────────────────────────────
  const deleteMoodboard = useCallback(async (id: string) => {
    void dbDeleteMoodboard(id);
    setMoodboards((prev) => prev.filter((b) => b.id !== id));
    setActiveMoodboardId((prev) => (prev === id ? null : prev));
  }, []);

  // ── SET ACTIVE ─────────────────────────────────────────────
  const setActiveMoodboard = useCallback((id: string) => {
    setActiveMoodboardId(id);
  }, []);

  // ── ADD ITEM ───────────────────────────────────────────────
  const addItemToBoard = useCallback(
    async (boardId: string, tile: TileProduct, position?: { x: number; y: number }) => {
      const posX = position?.x ?? Math.random() * 300;
      const posY = position?.y ?? Math.random() * 200;

      // Check if already in board
      const board = moodboards.find((b) => b.id === boardId);
      if (board?.items.some((i) => i.productId === tile.id)) return;

      // DB write (async)
      const dbItemId = await dbAddMoodboardItem(boardId, tile.id, posX, posY);
      const itemId = dbItemId || generateId();

      const newItem: MoodboardItem = {
        id: itemId,
        productId: tile.id,
        product: tile,
        positionX: posX,
        positionY: posY,
        scale: 1.0,
        rotation: 0,
      };

      setMoodboards((prev) =>
        prev.map((b) =>
          b.id === boardId
            ? { ...b, items: [...b.items, newItem], updatedAt: new Date().toISOString() }
            : b
        )
      );
    },
    [moodboards]
  );

  // ── REMOVE ITEM ────────────────────────────────────────────
  const removeItemFromBoard = useCallback(async (boardId: string, itemId: string) => {
    void dbRemoveMoodboardItem(itemId);
    setMoodboards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, items: b.items.filter((i) => i.id !== itemId), updatedAt: new Date().toISOString() }
          : b
      )
    );
  }, []);

  // ── UPDATE POSITION (local only, debounced sync possible) ──
  const updateItemPosition = useCallback(
    (boardId: string, itemId: string, positionX: number, positionY: number, scale = 1.0, rotation = 0) => {
      setMoodboards((prev) =>
        prev.map((b) =>
          b.id === boardId
            ? {
                ...b,
                items: b.items.map((i) =>
                  i.id === itemId ? { ...i, positionX, positionY, scale, rotation } : i
                ),
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      );
    },
    []
  );

  // ── RENAME ─────────────────────────────────────────────────
  const renameMoodboard = useCallback(async (id: string, name: string) => {
    void dbRenameMoodboard(id, name);
    setMoodboards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b))
    );
  }, []);

  // ── SAVE THUMBNAIL ─────────────────────────────────────────
  const saveThumbnail = useCallback(async (boardId: string, thumbnailUrl: string) => {
    void dbSaveThumbnail(boardId, thumbnailUrl);
    setMoodboards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, thumbnailUrl } : b))
    );
  }, []);

  return {
    moodboards,
    activeMoodboard,
    isLoading,
    createMoodboard,
    deleteMoodboard,
    setActiveMoodboard,
    addItemToBoard,
    removeItemFromBoard,
    updateItemPosition,
    renameMoodboard,
    saveThumbnail,
  };
}

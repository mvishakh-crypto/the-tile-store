/// <reference types="vite/client" />
// ============================================================
// Supabase Client — Singleton with typed Database schema
// ============================================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if Supabase is configured (keys are real, not placeholders)
export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 30;

// Create the typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-client-name': 'the-tile-store',
        'x-client-version': '1.0.0',
      },
    },
  }
);

// ============================================================
// Session ID — anonymous session for cart/wishlist persistence
// ============================================================
const SESSION_KEY = 'atelier-session-id';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// ============================================================
// Storage helpers — Supabase Storage bucket utilities
// ============================================================
export const STORAGE_BUCKETS = {
  TILE_IMAGES: 'tile-images',
  ROOM_UPLOADS: 'room-uploads',
  MOODBOARDS: 'moodboards',
  BLOG_COVERS: 'blog-covers',
} as const;

export function getPublicStorageUrl(
  bucket: string,
  path: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!isSupabaseConfigured) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: options
      ? {
          width: options.width,
          height: options.height,
          quality: options.quality ?? 80,
          format: 'origin' as 'origin',
        }
      : undefined,
  });

  return data.publicUrl;
}

// ============================================================
// Error handler — standardized Supabase error logging
// ============================================================
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function handleSupabaseError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as { code: string; message: string; details?: unknown };
    console.error('[Supabase Error]', e.code, e.message);
    return { code: e.code, message: e.message, details: e.details };
  }

  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  console.error('[API Error]', message);
  return { code: 'UNKNOWN', message };
}

// ============================================================
// Pagination helper
// ============================================================
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export function getPaginationRange(params: PaginationParams): { from: number; to: number } {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

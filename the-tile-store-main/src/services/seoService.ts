// @ts-nocheck
// ============================================================
// SEO Settings — admin-editable site-wide + per-page meta config,
// backed by the seo_settings table (see migration
// 009_page_views_and_seo_settings.sql). Falls back to the hardcoded
// defaults in lib/seo.ts when Supabase isn't configured or a row
// hasn't been created yet.
// ============================================================
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const SEO_PAGE_KEYS = ['global', 'home', 'collections', 'calculator', 'partners'] as const;
export type SEOPageKey = typeof SEO_PAGE_KEYS[number];

export interface SEOPageSettings {
  pageKey: SEOPageKey;
  title: string;
  description: string;
  ogImageUrl: string | null;
}

/** Fetch all SEO settings rows, keyed by page. Used both by the public site (to merge overrides) and the admin panel (to populate the edit form). */
export async function getAllSEOSettings(): Promise<Record<string, SEOPageSettings>> {
  if (!isSupabaseConfigured) return {};

  const { data, error } = await supabase
    .from('seo_settings')
    .select('page_key, title, description, og_image_url');

  if (error || !data) return {};

  const map: Record<string, SEOPageSettings> = {};
  for (const row of data as any[]) {
    map[row.page_key] = {
      pageKey: row.page_key,
      title: row.title,
      description: row.description,
      ogImageUrl: row.og_image_url,
    };
  }
  return map;
}

/** Admin-only: upsert one page's SEO settings. */
export async function adminUpdateSEOSettings(
  pageKey: SEOPageKey,
  updates: { title: string; description: string; ogImageUrl?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('seo_settings')
    .upsert({
      page_key: pageKey,
      title: updates.title,
      description: updates.description,
      og_image_url: updates.ogImageUrl ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'page_key' });

  if (error) throw error;
}

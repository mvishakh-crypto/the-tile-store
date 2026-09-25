// @ts-nocheck
// ============================================================
// Analytics — Centralized event tracking
// All events are fire-and-forget, never block the UI
// Gracefully degrades when Supabase is not configured
// ============================================================
import { supabase, isSupabaseConfigured, getSessionId } from './supabase';

// ============================================================
// TYPES
// ============================================================

export type AnalyticsEventType =
  | 'product_view'
  | 'product_wishlist_add'
  | 'product_wishlist_remove'
  | 'product_compare_add'
  | 'product_inquiry_add'
  | 'search_query'
  | 'search_result_click'
  | 'visualizer_used'
  | 'booking_started'
  | 'booking_completed'
  | 'inquiry_submitted'
  | 'blog_view'
  | 'page_view';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  productId?: string;
  query?: string;
  resultCount?: number;
  metadata?: Record<string, string | number | boolean>;
}

// ============================================================
// SESSION
// ============================================================

let _cachedSessionId: string | null = null;

function getSession(): string {
  if (!_cachedSessionId) {
    _cachedSessionId = getSessionId();
  }
  return _cachedSessionId;
}

// ============================================================
// IN-MEMORY QUEUE (batches events to avoid request spam)
// ============================================================

interface QueuedEvent {
  type: AnalyticsEventType;
  productId?: string;
  query?: string;
  resultCount?: number;
  metadata?: Record<string, string | number | boolean>;
  timestamp: number;
}

const eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL_MS = 3000; // Flush every 3 seconds
const MAX_QUEUE_SIZE = 50;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    void flushEventQueue();
    flushTimer = null;
  }, FLUSH_INTERVAL_MS);
}

async function flushEventQueue(): Promise<void> {
  if (!isSupabaseConfigured || eventQueue.length === 0) {
    eventQueue.length = 0;
    return;
  }

  const batch = eventQueue.splice(0, eventQueue.length);
  const sessionId = getSession();

  // Flush product views
  const productViews = batch.filter((e) => e.type === 'product_view' && e.productId);
  if (productViews.length > 0) {
    await supabase.from('product_views').insert(
      productViews.map((e) => ({
        product_id: e.productId!,
        session_id: sessionId,
      }))
    );
  }

  // Flush search queries
  const searchEvents = batch.filter((e) => e.type === 'search_query' && e.query);
  if (searchEvents.length > 0) {
    await supabase.from('search_analytics').insert(
      searchEvents.map((e) => ({
        query: e.query!.toLowerCase().trim(),
        result_count: e.resultCount ?? 0,
        session_id: sessionId,
      }))
    );
  }
}

// ============================================================
// PUBLIC API — All functions are synchronous (fire-and-forget)
// ============================================================

/**
 * Track any analytics event. All tracking is non-blocking.
 * Returns immediately — database write happens asynchronously.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isSupabaseConfigured) return;

  eventQueue.push({
    ...event,
    timestamp: Date.now(),
  });

  // Flush immediately if queue is large
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    void flushEventQueue();
  } else {
    scheduleFlush();
  }
}

/**
 * Track a product page view (adds to product_views for recommendation engine).
 */
export function trackProductView(productId: string, source: 'catalog' | 'search' | 'recommendation' | 'direct' = 'direct'): void {
  trackEvent({ type: 'product_view', productId, metadata: { source } });
}

/**
 * Track a search query with result count.
 */
export function trackSearchQuery(query: string, resultCount: number): void {
  if (!query.trim()) return;
  trackEvent({ type: 'search_query', query, resultCount });
}

/**
 * Track when a user clicks a search result.
 */
export function trackSearchResultClick(query: string, productId: string): void {
  if (!isSupabaseConfigured) return;

  // Direct insert (not batched — important for CTR analytics)
  void supabase.from('search_analytics').insert({
    query: query.toLowerCase().trim(),
    result_count: 1,
    clicked_product_id: productId,
    session_id: getSession(),
  });
}

/**
 * Track adding a product to wishlist.
 */
export function trackWishlistAdd(productId: string): void {
  trackEvent({ type: 'product_wishlist_add', productId });
}

/**
 * Track adding a product to inquiry cart.
 */
export function trackInquiryAdd(productId: string): void {
  trackEvent({ type: 'product_inquiry_add', productId });
}

/**
 * Track Space Visualizer usage.
 */
export function trackVisualizerUsed(roomType: string, tileId: string): void {
  if (!isSupabaseConfigured) return;

  void supabase.from('visualizer_sessions').insert({
    room_type: roomType,
    selected_tile_id: tileId,
    session_id: getSession(),
  });
}

/**
 * Track a blog post view (increments view_count in blogs table).
 */
export function trackBlogView(blogId: string): void {
  if (!isSupabaseConfigured) return;

  // Direct update for blog view_count
  void supabase
    .from('blogs')
    .select('view_count')
    .eq('id', blogId)
    .single()
    .then(({ data }) => {
      if (data) {
        void supabase
          .from('blogs')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', blogId);
      }
    });
}

/**
 * Track page navigation for general analytics. Records a row in
 * page_views (session_id + path) for the admin panel's visitor
 * counter, in addition to the lightweight in-memory list.
 */
export function trackPageView(page: string): void {
  if (typeof window !== 'undefined') {
    (window as Window & { _atelierAnalytics?: { pages: string[] } })._atelierAnalytics = {
      ...(window as Window & { _atelierAnalytics?: { pages: string[] } })._atelierAnalytics,
      pages: [
        ...(((window as Window & { _atelierAnalytics?: { pages: string[] } })._atelierAnalytics?.pages) ?? []).slice(-49),
        page,
      ],
    };
  }

  if (!isSupabaseConfigured) return;

  // Direct insert (not the batched queue) — a page view is a single,
  // infrequent event we don't want lost if the tab closes before a
  // batch flush fires.
  void supabase.from('page_views').insert({
    session_id: getSession(),
    path: page,
  });
}

/**
 * Flush all queued events immediately (call on page unload).
 */
export function flushAnalytics(): void {
  void flushEventQueue();
}

// Flush on page unload to capture any remaining events
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAnalytics();
    }
  });
}

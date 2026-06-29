import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Cross-tab synchronization via localStorage events (for mock / dev mode)
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      // Check if it's a key used by our services
      if (e.key.startsWith('tts-local-') || e.key === 'atelier-inquiry-cart') {
        console.info('[RealtimeSync] Local storage update detected in another tab. Invalidating cache:', e.key);
        
        if (e.key.includes('products') || e.key.includes('brands') || e.key.includes('categories')) {
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        } else if (e.key.includes('blogs') || e.key.includes('galleries')) {
          queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.galleries.all });
        } else if (e.key.includes('inquiries')) {
          queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        } else if (e.key.includes('bookings')) {
          queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        } else {
          // Fallback: invalidate all queries
          queryClient.invalidateQueries();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 2. Supabase Realtime PostgreSQL Subscriptions (for production)
    if (!isSupabaseConfigured) {
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    console.info('[RealtimeSync] Supabase is configured. Setting up Realtime subscriptions...');

    // Subscribe to products mutations
    const productsChannel = supabase
      .channel('db-products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.info('[RealtimeSync] Realtime update on public.products table:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        }
      )
      .subscribe();

    // Subscribe to inquiries mutations
    const inquiriesChannel = supabase
      .channel('db-inquiries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.info('[RealtimeSync] Realtime update on public.inquiries table:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        }
      )
      .subscribe();

    // Subscribe to bookings mutations
    const bookingsChannel = supabase
      .channel('db-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.info('[RealtimeSync] Realtime update on public.bookings table:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        }
      )
      .subscribe();

    // Subscribe to blogs mutations
    const blogsChannel = supabase
      .channel('db-blogs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blogs' },
        (payload) => {
          console.info('[RealtimeSync] Realtime update on public.blogs table:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
        }
      )
      .subscribe();

    // Subscribe to galleries mutations
    const galleriesChannel = supabase
      .channel('db-galleries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'galleries' },
        (payload) => {
          console.info('[RealtimeSync] Realtime update on public.galleries table:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.galleries.all });
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      void supabase.removeChannel(productsChannel);
      void supabase.removeChannel(inquiriesChannel);
      void supabase.removeChannel(bookingsChannel);
      void supabase.removeChannel(blogsChannel);
      void supabase.removeChannel(galleriesChannel);
    };
  }, [queryClient]);
}
export default useRealtimeSync;

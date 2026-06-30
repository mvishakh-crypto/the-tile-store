-- ============================================================
-- THE TILE STORE — Enable Supabase Realtime
-- Migration: 008_enable_realtime.sql
--
-- Adds the five tables that useRealtimeSync.ts subscribes to
-- into the supabase_realtime publication, idempotently.
-- REPLICA IDENTITY FULL is required so UPDATE and DELETE events
-- carry the full row data (not just the primary key).
-- ============================================================

-- Add tables to the Supabase Realtime publication (idempotent)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['products', 'inquiries', 'bookings', 'blogs', 'galleries']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Set REPLICA IDENTITY FULL so realtime payloads include old row values
-- (running this multiple times is harmless)
ALTER TABLE public.products  REPLICA IDENTITY FULL;
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.bookings  REPLICA IDENTITY FULL;
ALTER TABLE public.blogs     REPLICA IDENTITY FULL;
ALTER TABLE public.galleries REPLICA IDENTITY FULL;

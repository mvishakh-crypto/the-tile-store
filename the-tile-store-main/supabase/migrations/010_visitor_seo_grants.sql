-- ============================================================
-- Explicit privilege grants for the objects created in migration
-- 009. RLS policies control row-level access, but PostgREST also
-- requires the base table/function-level privilege to even expose
-- an object via the API — without it, PostgREST correctly excludes
-- the object from its schema cache, which looks identical to a
-- stale-cache problem (same "not found in schema cache" error) but
-- no amount of NOTIFY/restart fixes it, since there's nothing to
-- refresh. Other custom functions in this schema (get_dashboard_stats,
-- get_popular_searches, increment_blog_views) already follow this
-- same GRANT EXECUTE pattern — this migration was just missing it.
-- ============================================================

GRANT SELECT, INSERT ON page_views TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON seo_settings TO anon, authenticated;

GRANT EXECUTE ON FUNCTION get_visit_stats(INT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

NOTIFY pgrst, 'reload schema';

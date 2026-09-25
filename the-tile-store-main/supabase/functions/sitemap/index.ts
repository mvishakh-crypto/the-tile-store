// ============================================================
// Edge Function: sitemap
// Generates dynamic XML sitemap from products, blogs, categories
// Deploy: supabase functions deploy sitemap
// Access: GET /functions/v1/sitemap
// ============================================================
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'https://www.thetilestore.in';

function xmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(path: string, priority: number, changefreq: string, lastmod?: string): string {
  // path is a real, path-based route (e.g. '/', '/collections', '/product/x') —
  // matches the site's routing since the hash -> path migration (Phase 6).
  return `
  <url>
    <loc>${xmlEncode(`${APP_URL}${path}`)}</loc>
    <priority>${priority.toFixed(1)}</priority>
    <changefreq>${changefreq}</changefreq>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch all published products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('in_stock', true)
      .order('popularity_score', { ascending: false });

    // Fetch all published blog posts
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    // Fetch all categories
    const { data: categories } = await supabase
      .from('product_categories')
      .select('slug');

    const now = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    const urls = [
      // Homepage
      urlEntry('/', 1.0, 'daily', now),
      // Static pages
      urlEntry('/collections', 0.9, 'daily', now),
      urlEntry('/calculator', 0.7, 'monthly'),
      urlEntry('/blog', 0.8, 'weekly', now),
      urlEntry('/partners', 0.7, 'monthly'),
      // NOTE: visualizer/brands/projects/booking are same-page anchor
      // sections on the homepage as of Phase 6 (not separate documents) —
      // intentionally not listed here; a fragment URL offers a crawler
      // nothing beyond what '/' already gives it.

      // Categories
      ...(categories || []).map(cat =>
        urlEntry(`/collections?category=${cat.slug}`, 0.85, 'weekly', now)
      ),

      // Product pages
      ...(products || []).map(p =>
        urlEntry(
          `/product/${p.slug}`,
          0.9,
          'weekly',
          p.updated_at ? new Date(p.updated_at as string).toISOString().split('T')[0] : now
        )
      ),

      // Blog articles
      ...(blogs || []).map(b =>
        urlEntry(
          `/blog/read/${b.slug}`,
          0.7,
          'monthly',
          b.updated_at ? new Date(b.updated_at as string).toISOString().split('T')[0] : now
        )
      ),
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (err) {
    console.error('[sitemap] Error:', err);
    return new Response('<error>Failed to generate sitemap</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});

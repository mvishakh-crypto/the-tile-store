// ============================================================
// Edge Function: sitemap
// Generates dynamic XML sitemap from products, blogs, categories
// Deploy: supabase functions deploy sitemap
// Access: GET /functions/v1/sitemap
// ============================================================
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'https://thetilestore.com';

function xmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, priority: number, changefreq: string, lastmod?: string): string {
  return `
  <url>
    <loc>${xmlEncode(`${APP_URL}/${loc}`)}</loc>
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
      urlEntry('#/', 1.0, 'daily', now),
      // Static pages
      urlEntry('#/collections', 0.9, 'daily', now),
      urlEntry('#/calculator', 0.7, 'monthly'),
      urlEntry('#/blog', 0.8, 'weekly', now),
      urlEntry('#/partners', 0.7, 'monthly'),
      urlEntry('#/visualizer', 0.8, 'monthly'),
      urlEntry('#/brands', 0.7, 'monthly'),
      urlEntry('#/projects', 0.7, 'monthly'),
      urlEntry('#/booking', 0.8, 'monthly'),

      // Categories
      ...(categories || []).map(cat =>
        urlEntry(`#/collections?category=${cat.slug}`, 0.85, 'weekly', now)
      ),

      // Product pages
      ...(products || []).map(p =>
        urlEntry(
          `#/product/${p.slug}`,
          0.9,
          'weekly',
          p.updated_at ? new Date(p.updated_at as string).toISOString().split('T')[0] : now
        )
      ),

      // Blog articles
      ...(blogs || []).map(b =>
        urlEntry(
          `#/blog/read/${b.slug}`,
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

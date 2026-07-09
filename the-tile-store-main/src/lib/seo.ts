// ============================================================
// SEO Library — Dynamic meta tag and structured data injection
// Extends the existing App.tsx SEO logic with Open Graph and Twitter Cards
// ============================================================

export interface SEOConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, unknown>;
  noIndex?: boolean;
}

const DEFAULT_CONFIG: SEOConfig = {
  title: 'The Tile Store — Premium Luxury Surfaces & Interiors',
  description:
    'Discover premium luxury tiles, marble slabs, and designer surfaces. Curated collections for architects and interior designers in Kerala and across India.',
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  type: 'website',
};

const SITE_NAME = 'The Tile Store';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://thetilestore.com';
const TWITTER_HANDLE = '@thetilestore';

/**
 * Apply SEO meta tags to the document head.
 * Call this whenever the current page/route changes.
 */
export function applySEO(config: Partial<SEOConfig>): void {
  const merged: SEOConfig = { ...DEFAULT_CONFIG, ...config };
  const fullTitle = merged.title.includes(SITE_NAME) ? merged.title : `${merged.title} | ${SITE_NAME}`;

  // Title
  document.title = fullTitle;

  // Helpers
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  const setMetaName = (name: string, content: string) =>
    setMeta(`meta[name="${name}"]`, 'content', content);

  const setMetaProperty = (property: string, content: string) =>
    setMeta(`meta[property="${property}"]`, 'content', content);

  // Basic meta
  setMetaName('description', merged.description);
  setMetaName('robots', merged.noIndex ? 'noindex, nofollow' : 'index, follow');
  setMetaName('author', SITE_NAME);
  setMetaName('theme-color', '#1a1a1a');

  // Canonical
  if (merged.canonicalUrl) {
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', merged.canonicalUrl);
  }

  // Open Graph
  setMetaProperty('og:site_name', SITE_NAME);
  setMetaProperty('og:title', fullTitle);
  setMetaProperty('og:description', merged.description);
  setMetaProperty('og:type', merged.type || 'website');
  setMetaProperty('og:url', merged.canonicalUrl || SITE_URL + window.location.hash);
  if (merged.image) {
    setMetaProperty('og:image', merged.image);
    setMetaProperty('og:image:alt', merged.title);
    setMetaProperty('og:image:width', '1200');
    setMetaProperty('og:image:height', '630');
  }
  setMetaProperty('og:locale', 'en_IN');

  // Twitter Cards
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:site', TWITTER_HANDLE);
  setMetaName('twitter:title', fullTitle);
  setMetaName('twitter:description', merged.description);
  if (merged.image) {
    setMetaName('twitter:image', merged.image);
  }

  // JSON-LD Structured Data
  if (merged.schema) {
    let scriptEl = document.getElementById('jsonld-schema') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'jsonld-schema';
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.innerHTML = JSON.stringify(merged.schema);
  }
}

// ============================================================
// PRE-BUILT SEO CONFIGS for each page/route
// ============================================================

export const SEO_CONFIGS = {
  home: (): SEOConfig => ({
    title: 'The Tile Store — Premium Luxury Surfaces & Interiors | Curated Slabs & Tile Archive',
    description:
      'Discover premium luxury tiles, marble slabs, and designer surfaces. Curated collections for architects and interior designers in Kerala and across India.',
    canonicalUrl: SITE_URL,
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      description:
        'Premium luxury tiles, marble slabs, and designer surfaces for architects and interior designers.',
      url: SITE_URL,
      telephone: '+919876543210',
      priceRange: '₹₹₹',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kochi',
        addressRegion: 'Kerala',
        postalCode: '682001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '9.9312',
        longitude: '76.2673',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '18:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/the.tilestore.official/',
        'https://www.facebook.com/share/14gwwRM3WpF/',
      ],
    },
  }),

  collections: (): SEOConfig => ({
    title: 'Tile Collections — Italian Porcelain, Marble Slabs & Designer Surfaces',
    description:
      'Explore our luxury tile collections. Filter by brand, style, size, finish, and price category. From Statuario marble to artisanal Zellige.',
    canonicalUrl: `${SITE_URL}/#/collections`,
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Tile Collections',
      description: 'Complete luxury tile and slab collection with advanced filters.',
      url: `${SITE_URL}/#/collections`,
    },
  }),

  product: (product: {
    name: string;
    description: string;
    image: string;
    code: string;
    material: string;
    finish: string;
    brand?: string;
    priceCategory: string;
    slug?: string;
    id: string;
  }): SEOConfig => ({
    title: `${product.name} — ${product.finish} ${product.material} | The Tile Store`,
    description: product.description.slice(0, 160) + (product.description.length > 160 ? '...' : ''),
    image: product.image,
    canonicalUrl: `${SITE_URL}/#/product/${product.id}`,
    type: 'product',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description,
      sku: product.code,
      mpn: product.code,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Atelier Selection',
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      },
    },
  }),

  blog: (): SEOConfig => ({
    title: 'Atelier Editorial — Interior Design Trends, Tile Guides & Material Science',
    description:
      'Read our expert guides on tile selection, material science, design trends, slip resistance ratings, and architectural surface care.',
    canonicalUrl: `${SITE_URL}/#/blog`,
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Atelier Editorial',
      description: 'Design insights, material guides, and architectural trends from The Tile Store.',
      url: `${SITE_URL}/#/blog`,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  }),

  blogPost: (post: {
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    authorName: string;
    publishedAt: string | null;
    slug: string;
    tags: string[];
  }): SEOConfig => ({
    title: `${post.title} | Atelier Editorial — The Tile Store`,
    description: post.excerpt || post.title,
    image: post.coverImage || undefined,
    canonicalUrl: `${SITE_URL}/#/blog/read/${post.slug}`,
    type: 'article',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.title,
      image: post.coverImage || undefined,
      author: {
        '@type': 'Organization',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      datePublished: post.publishedAt || undefined,
      keywords: post.tags.join(', '),
      url: `${SITE_URL}/#/blog/read/${post.slug}`,
    },
  }),

  partners: (): SEOConfig => ({
    title: 'B2B Trade Portal — Architect, Builder & Dealer Partnerships | The Tile Store',
    description:
      'Join the Atelier Trade Program. Access wholesale B2B pricing, CAD spec files, priority sample boxes, and dedicated account management.',
    canonicalUrl: `${SITE_URL}/#/partners`,
    type: 'website',
  }),

  calculator: (): SEOConfig => ({
    title: 'Tile Area Calculator — Accurate Quantity & Cost Estimator | The Tile Store',
    description:
      'Calculate the exact number of tile boxes and material cost for your project. Includes wastage factor, grout, adhesive estimation.',
    canonicalUrl: `${SITE_URL}/#/calculator`,
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tile Area Calculator',
      applicationCategory: 'UtilityApplication',
      description: 'Accurate tile quantity and cost calculator for architects and builders.',
      url: `${SITE_URL}/#/calculator`,
    },
  }),
};

// ============================================================
// Image optimization URL builder
// ============================================================
export function getOptimizedImageUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // For Unsplash images, add fit/crop/format params
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    if (options.width) url.searchParams.set('w', String(options.width));
    if (options.height) url.searchParams.set('h', String(options.height));
    url.searchParams.set('q', String(options.quality ?? 80));
    url.searchParams.set('fm', 'webp');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  return src;
}

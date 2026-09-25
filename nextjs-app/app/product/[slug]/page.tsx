import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductByIdOrSlug, getRelatedProducts } from '@/services/productService';
import ProductPageClient from './ProductPageClient';

const SITE_URL = 'https://www.thetilestore.in';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(decodeURIComponent(slug));

  if (!product) {
    return { title: 'Product Not Found | The Tile Store' };
  }

  const description =
    product.description.length > 160
      ? product.description.slice(0, 160) + '...'
      : product.description;
  const productUrl = `${SITE_URL}/product/${product.slug || product.id}`;

  return {
    title: `${product.name} — ${product.finish} ${product.material} | The Tile Store`,
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      title: product.name,
      description,
      images: [product.image],
      url: productUrl,
      type: 'website',
    },
  };
}

export default async function ProductRoute({ params }: Params) {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(decodeURIComponent(slug));

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);

  // JSON-LD: Product + BreadcrumbList, built server-side from the same
  // data already fetched above — carries over the Phase 5 (SEO plan)
  // schema content, just server-rendered now instead of injected by a
  // client-side effect.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description,
      sku: product.code,
      mpn: product.code,
      brand: { '@type': 'Brand', name: product.brand || 'Atelier Selection' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'The Tile Store' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE_URL}/collections` },
        { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/product/${product.slug || product.id}` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient
        productId={product.slug || product.id}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}

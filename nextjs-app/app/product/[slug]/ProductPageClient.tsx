'use client';

import { useRouter } from 'next/navigation';
import ProductDetailPage from '@/page-components/ProductDetailPage';
import type { TileProduct } from '@/types';

interface ProductPageClientProps {
  productId: string;
  initialProduct: TileProduct;
  initialRelatedProducts: TileProduct[];
}

// Translates the app's existing '#/...' route-key strings (unchanged
// throughout every ported component) into real Next.js navigation.
// Same translation table as the Vite app's Phase 6 routeKeyToPath —
// duplicated here rather than shared, since this app's real router is
// Next's own, not the hand-rolled one Phase 6 built for the Vite app.
function routeKeyToPath(routeKey: string): string {
  if (!routeKey.startsWith('#/')) return routeKey;
  if (routeKey.startsWith('#/product/')) return `/product/${routeKey.replace('#/product/', '')}`;
  if (routeKey.startsWith('#/category/')) return `/collections?category=${routeKey.replace('#/category/', '')}`;
  if (routeKey === '#/collections/all' || routeKey === '#/collections') return '/collections';
  if (routeKey === '#/partners') return '/partners';
  if (routeKey === '#/calculator') return '/calculator';
  if (routeKey === '#/blog') return '/blog';
  if (routeKey.startsWith('#/blog/read/')) return `/blog/read/${routeKey.replace('#/blog/read/', '')}`;
  return '/';
}

export default function ProductPageClient({
  productId,
  initialProduct,
  initialRelatedProducts,
}: ProductPageClientProps) {
  const router = useRouter();

  return (
    <ProductDetailPage
      productId={productId}
      initialProduct={initialProduct}
      initialRelatedProducts={initialRelatedProducts}
      onNavigate={(routeKey) => router.push(routeKeyToPath(routeKey))}
      // TODO(Phase 6): wishlist/compare/inquiry-cart are app-wide shared
      // state in the original app (managed at the top of App.tsx, passed
      // down through many layers of props). That shared-state layer
      // hasn't been rebuilt yet in this migration — these are inert
      // stubs so the page renders and is fully readable/crawlable now,
      // with the real interactive wiring landing in Phase 6, not silently
      // faked as working.
      onAddToInquiry={() => {}}
      onAddToWishlist={() => {}}
      onRemoveFromWishlist={() => {}}
      wishlist={[]}
      comparedProducts={[]}
      onAddToCompare={() => {}}
      onRemoveFromCompare={() => {}}
      onSelectTileForVisualizer={() => {}}
    />
  );
}

import type { NextPageWithLayout } from '@/types';
import type { RatingCount } from '@/types';
import type { InferGetStaticPropsType } from 'next';
import { getLayout } from '@/components/layouts/layout';
import { AttributesProvider } from '@/components/products/details/attributes.context';
import Seo from '@/components/seo/seo';
import { useWindowSize } from '@/lib/use-window-size';
import AverageRatings from '@/components/reviews/average-ratings';
import ProductReviews from '@/components/reviews/product-reviews';
import isEmpty from 'lodash/isEmpty';
import dynamic from 'next/dynamic';
import { useReviewSummary } from '@/framework/rest/review';
import { useRelatedProducts } from '@/framework/rest/product';

import { getStaticPaths, getStaticProps } from '@/framework/product.ssr';
export { getStaticPaths, getStaticProps };

/**
 * Kolshi S6 — product detail page.
 *
 * `ProductQuestions` (the product Q&A block) is removed. Kolshi has no
 * Q&A endpoints (decision log I.2 Coming Soon); the feature has been
 * pulled from the PDP until a backend ships. Reviews and ratings remain
 * fully wired.
 *
 * FIX 11A — `useReviewSummary` fetches live rating stats from
 *   `GET /reviews/products/{productId}/summary` and overrides the
 *   stale build-time values baked into the product DTO.
 *
 * FIX 11B — `useRelatedProducts` fetches live recommendations from
 *   `GET /products/{productId}/recommendations` (or related endpoint)
 *   and replaces the static `product.related_products` from SSG.
 */
const Details = dynamic(() => import('@/components/products/details/details'));
const BookDetails = dynamic(
  () => import('@/components/products/details/book-details'),
);
const RelatedProducts = dynamic(
  () => import('@/components/products/details/related-products'),
);
const CartCounterButton = dynamic(
  () => import('@/components/cart/cart-counter-button'),
  { ssr: false },
);

const ProductPage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ product }: any) => {
  const { width } = useWindowSize();

  // Live rating summary — overrides stale SSG snapshot.
  const { summary } = useReviewSummary(product?.id);

  // Derive RatingCount[] from the Kolshi breakdown map (keyed 1–5).
  const liveRatingCount: RatingCount[] | undefined = summary?.breakdown
    ? Object.entries(summary.breakdown).map(([rating, total]) => ({
        rating: Number(rating),
        total: total as number,
      }))
    : undefined;

  // Live related products — overrides stale SSG snapshot.
  const { products: relatedProducts } = useRelatedProducts(product?.id);
  const displayRelated =
    relatedProducts.length > 1 ? relatedProducts : product?.related_products;

  return (
    <>
      <Seo
        title={product.name}
        url={product.slug}
        images={!isEmpty(product?.image) ? [product.image] : []}
      />
      <AttributesProvider>
        <div className="min-h-screen bg-light">
          {product.type?.slug === 'books' ? (
            <BookDetails product={product} />
          ) : (
            <>
              <Details product={product} />
              <AverageRatings
                title={product?.name}
                ratingCount={liveRatingCount ?? product?.rating_count}
                totalReviews={summary?.total ?? product?.total_reviews}
                ratings={summary?.average ?? product?.ratings}
              />
            </>
          )}

          <ProductReviews
            productId={product?.id}
            productType={product?.type?.slug}
          />
          {product.type?.slug !== 'books' &&
            (displayRelated?.length ?? 0) > 1 && (
              <div className="p-5 lg:p-14 xl:p-16">
                <RelatedProducts
                  products={displayRelated}
                  currentProductId={product.id}
                  gridClassName="lg:grid-cols-4 2xl:grid-cols-5 !gap-3"
                />
              </div>
            )}
        </div>
        {width > 1023 && <CartCounterButton />}
      </AttributesProvider>
    </>
  );
};
ProductPage.getLayout = getLayout;
export default ProductPage;

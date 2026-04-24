import Seo from '@/components/seo/seo';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { useTranslation } from 'next-i18next';
import rangeMap from '@/lib/range-map';
import ProductLoader from '@/components/ui/loaders/product-loader';
import ErrorMessage from '@/components/ui/error-message';
import dynamic from 'next/dynamic';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import PageBanner from '@/components/banners/page-banner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import { useProducts } from '@/framework/product';
import ProductCard from '@/components/products/cards/card';

const CartCounterButton = dynamic(
  () => import('@/components/cart/cart-counter-button'),
  { ssr: false },
);

/**
 * Kolshi C.14 — per-shop offers no longer come from a coupons feed
 * (coupons are global in Kolshi). Instead the offers page lists the
 * shop's cheapest products (`sortBy=price_asc`) so customers can
 * still discover deals. A future phase can layer in an explicit
 * "sale_price" filter once the backend exposes one.
 */
export default function ShopOffersPage() {
  const { t } = useTranslation('common');
  const {
    query: { slug },
  } = useRouter();
  const { data: shopData, isLoading: isLoadingShop } = useShop({
    slug: slug as string,
  });
  const shopId = shopData?.id;

  const { products, isLoading, isLoadingMore, hasMore, error, loadMore } =
    useProducts({
      shopId,
      sortBy: 'price_asc',
      limit: 30,
    });

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Seo title="Offers" url="offers" />
      <PageBanner
        title={t('text-offers-title')}
        breadcrumbTitle={t('text-home')}
      />
      <div className="w-full px-4 py-12 mx-auto bg-gray-100 max-w-1920 lg:py-14 lg:px-8 xl:py-24 xl:px-16 2xl:px-20">
        {isLoading || isLoadingShop ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-8 2xl:grid-cols-6">
            {rangeMap(6, (i) => (
              <ProductLoader key={i} uniqueKey={`product-${i}`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-lg mx-auto bg-gray-100">
            <NotFound text="text-no-products-found" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-8 2xl:grid-cols-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="bg-light"
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex items-center justify-center mt-8 lg:mt-12">
                <Button onClick={loadMore} loading={isLoadingMore}>
                  {t('text-load-more')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CartCounterButton />
    </>
  );
}

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

ShopOffersPage.getLayout = getLayoutWithFooter;

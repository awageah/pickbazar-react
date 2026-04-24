import type { NextPageWithLayout } from '@/types';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { useTranslation } from 'next-i18next';
import rangeMap from '@/lib/range-map';
import { useShops, useShopSearch } from '@/framework/shop';
import ErrorMessage from '@/components/ui/error-message';
import { SHOPS_LIMIT } from '@/lib/constants';
export { getStaticProps } from '@/framework/shops-page.ssr';
import { useRouter } from 'next/router';
import ShopCard from '@/components/ui/cards/shop';
import CouponLoader from '@/components/ui/loaders/coupon-loader';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import { mapPaginatorData } from '@/framework/utils/data-mappers';

/**
 * Kolshi C.12 — the "near-by shops" module was removed (no backend
 * support). This page is re-wired to the text search endpoint
 * `GET /shops/search?searchTerm=`, falling back to the full paginated
 * shops list when the query is empty so it remains a useful landing
 * page even without input.
 */
const ShopsSearchPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const limit = SHOPS_LIMIT;
  const term = (query?.q ?? query?.searchTerm ?? '') as string;

  const defaultShops = useShops({ limit });
  const searchQuery = useShopSearch(term, { limit });

  const isSearching = term.trim().length > 0;
  const isLoading = isSearching
    ? searchQuery.isLoading
    : defaultShops.isLoading;
  const error = (isSearching ? searchQuery.error : defaultShops.error) as
    | Error
    | null;

  const shops = isSearching
    ? searchQuery.data?.pages?.flatMap((p) => p.data) ?? []
    : defaultShops.shops;
  const hasMore = isSearching
    ? Boolean(searchQuery.hasNextPage)
    : defaultShops.hasMore;
  const loadMore = isSearching
    ? () => searchQuery.fetchNextPage()
    : defaultShops.loadMore;
  const isLoadingMore = isSearching
    ? Boolean(searchQuery.isFetchingNextPage)
    : defaultShops.isLoadingMore;

  // Keep pagination info consistent between the two data sources.
  const paginatorInfo = isSearching
    ? searchQuery.data?.pages?.[searchQuery.data.pages.length - 1]
      ? mapPaginatorData(
          searchQuery.data.pages[searchQuery.data.pages.length - 1],
        )
      : null
    : defaultShops.paginatorInfo;
  void paginatorInfo;

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="min-h-screen bg-light">
      <div className="mx-auto flex w-full max-w-[1492px] flex-col p-8 pt-14">
        <h3 className="mb-8 text-2xl font-bold text-heading">
          {isSearching
            ? t('text-search-results-for', { defaultValue: 'Results for' }) +
              ` "${term}"`
            : t('text-all-shops')}
        </h3>

        {isLoading && !shops.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
            {rangeMap(limit, (i) => (
              <CouponLoader key={i} uniqueKey={`shop-${i}`} />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <NotFound className="max-w-lg mx-auto" text="text-no-shops" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
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
    </div>
  );
};

ShopsSearchPage.getLayout = getLayoutWithFooter;

export default ShopsSearchPage;

import type {
  Shop,
  ShopPaginator,
  ShopQueryOptions,
} from '@/types';
import { useQuery, useInfiniteQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';

export function useShops(options?: Partial<ShopQueryOptions>) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ShopPaginator, Error>(
    [API_ENDPOINTS.SHOPS, options],
    ({ queryKey, pageParam }) =>
      client.shops.all(Object.assign({}, queryKey[1] as any, pageParam)),
    {
      // Raw Kolshi response (via HttpClient.get) uses `page`/`lastPage`.
      getNextPageParam: ({ page: currentPage, lastPage: totalPages }: any) =>
        totalPages > currentPage ? { page: currentPage + 1 } : undefined,
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    shops: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
}

export const useShop = (
  { slug, enabled }: { slug: string; enabled?: boolean },
  _options?: any,
) => {
  return useQuery<Shop, Error>(
    [API_ENDPOINTS.SHOPS, { slug }],
    () => client.shops.get(slug),
    { enabled: enabled },
  );
};

/**
 * `GET /shops/search?searchTerm=…`. Paginated. Debouncing is the
 * caller's responsibility — typically handled by the search input
 * component that owns the `term` atom.
 */
export function useShopSearch(
  term: string,
  params?: Partial<ShopQueryOptions>,
) {
  return useInfiniteQuery<ShopPaginator, Error>(
    [`${API_ENDPOINTS.SHOPS}/search`, { searchTerm: term, ...params }],
    ({ queryKey, pageParam }) =>
      client.shops.search(term, {
        ...(queryKey[1] as Record<string, unknown>),
        ...(pageParam as object),
      }),
    {
      enabled: Boolean(term && term.length > 0),
      // Raw Kolshi response (via HttpClient.get) uses `page`/`lastPage`.
      getNextPageParam: ({ page: currentPage, lastPage: totalPages }: any) =>
        totalPages > currentPage ? { page: currentPage + 1 } : undefined,
    },
  );
}

import type {
  Shop,
  ShopMapLocation,
  ShopPaginator,
  ShopQueryOptions,
  ShopMaintenanceEvent,
} from '@/types';
import { useQuery, useInfiniteQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { toast } from 'react-toastify';

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
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
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
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    },
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Coming-Soon / Deleted hooks — retained as compiling stubs so legacy
 * callers in map / maintenance UIs compile until they are removed in
 * S6. Each throws a toast the moment a user triggers it.
 * ──────────────────────────────────────────────────────────────────── */

export const useSearchNearShops = () => {
  return {
    mutate: () => toast.info('Near-by shops are not supported in Kolshi.'),
    mutateAsync: async () => undefined,
    isLoading: false,
    data: undefined,
    error: undefined,
  } as any;
};

export const useGetSearchNearShops = (_input: ShopMapLocation) => {
  return {
    data: [] as Shop[],
    isLoading: false,
    error: undefined,
  };
};

export const useShopMaintenanceEvent = () => {
  return {
    createShopMaintenanceEventRequest: (_input: ShopMaintenanceEvent) =>
      toast.info('Shop maintenance toggle is not supported in Kolshi.'),
    isLoading: false,
  };
};

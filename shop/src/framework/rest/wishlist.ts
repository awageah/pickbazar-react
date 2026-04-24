/**
 * Wishlist hooks — Kolshi J.1.
 *
 * Backing endpoints:
 *   - `GET /wishlist`                          — paginated list
 *   - `DELETE /wishlist`                       — clear
 *   - `GET /wishlist/count`                    — `{ count }`
 *   - `POST /wishlist/products/{productId}`    — add
 *   - `DELETE /wishlist/products/{productId}`  — remove
 *   - `GET /wishlist/products/{productId}/check` — `{ inWishlist }`
 *
 * Kolshi has no atomic toggle endpoint. `useToggleWishlist` runs a
 * check-then-add/remove round-trip via `client.wishlist.toggle`; the
 * cached `inWishlist` flag is flipped optimistically so the heart icon
 * reacts instantly.
 *
 * All mutations require auth (backend enforces `hasAuthority('customer')`);
 * the UI gates the button behind the login modal for guests before the
 * hook is ever reached.
 */
import type { WishlistPaginator, WishlistQueryOptions } from '@/types';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { toast } from 'react-toastify';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from './utils/data-mappers';

/** Query key used by `useInWishlist` — centralised so mutations can mutate the cache. */
const inWishlistKey = (productId: string | number) => [
  `${API_ENDPOINTS.WISHLIST}/in_wishlist`,
  String(productId),
];

export function useToggleWishlist(product_id: string | number) {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const {
    mutate: toggleWishlist,
    isLoading,
    isSuccess,
  } = useMutation(client.wishlist.toggle, {
    onMutate: async () => {
      // Optimistically flip the cached flag so the heart reacts instantly.
      await queryClient.cancelQueries(inWishlistKey(product_id));
      const previous = queryClient.getQueryData<boolean>(
        inWishlistKey(product_id),
      );
      queryClient.setQueryData<boolean>(
        inWishlistKey(product_id),
        !Boolean(previous),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          inWishlistKey(product_id),
          context.previous ?? false,
        );
      }
      if (axios.isAxiosError(error)) {
        toast.error(`${t(error.response?.data?.message ?? 'text-error')}`);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        inWishlistKey(product_id),
        Boolean(data?.in_wishlist),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST]);
      queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST_COUNT]);
    },
  });

  return { toggleWishlist, isLoading, isSuccess };
}

export function useRemoveFromWishlist() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const {
    mutate: removeFromWishlist,
    isLoading,
    isSuccess,
  } = useMutation(
    (productId: string | number) => client.wishlist.remove(productId),
    {
      onSuccess: (_data, productId) => {
        toast.success(`${t('text-removed-from-wishlist')}`);
        queryClient.setQueryData(inWishlistKey(productId), false);
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST]);
        queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST_COUNT]);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(`${t(error.response?.data?.message ?? 'text-error')}`);
        }
      },
    },
  );

  return { removeFromWishlist, isLoading, isSuccess };
}

export function useWishlist(options?: Partial<WishlistQueryOptions>) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<WishlistPaginator, Error>(
    [API_ENDPOINTS.WISHLIST, options ?? {}],
    ({ queryKey, pageParam }) =>
      client.wishlist.all(
        Object.assign({}, queryKey[1] as WishlistQueryOptions, pageParam),
      ),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    },
  );

  return {
    wishlists: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: () => fetchNextPage(),
    hasMore: Boolean(hasNextPage),
  };
}

export function useInWishlist({
  enabled,
  product_id,
}: {
  product_id: string | number;
  enabled: boolean;
}) {
  const { data, isLoading, error, refetch } = useQuery<boolean, Error>(
    inWishlistKey(product_id),
    () => client.wishlist.checkIsInWishlist({ product_id }),
    {
      enabled: enabled && Boolean(product_id),
      // Wishlist membership changes infrequently — 1 minute is a sane default.
      staleTime: 60_000,
    },
  );
  return {
    inWishlist: Boolean(data),
    isLoading,
    error,
    refetch,
  };
}

/**
 * `GET /wishlist/count` — rendered in the profile sidebar and (future)
 * header chip. Disabled by default; pass `enabled: true` when the
 * caller is actually going to render the count.
 */
export function useWishlistCount({ enabled = false }: { enabled?: boolean } = {}) {
  const { data, isLoading, error } = useQuery<{ count: number }, Error>(
    [API_ENDPOINTS.WISHLIST_COUNT],
    () => client.wishlist.count(),
    {
      enabled,
      staleTime: 30_000,
    },
  );
  return { count: Number(data?.count ?? 0), isLoading, error };
}

export function useClearWishlist() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { mutate: clearWishlist, isLoading } = useMutation(
    () => client.wishlist.clear(),
    {
      onSuccess: () => {
        toast.success(`${t('text-wishlist-cleared')}`);
        queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST]);
        queryClient.invalidateQueries([API_ENDPOINTS.WISHLIST_COUNT]);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(`${t(error.response?.data?.message ?? 'text-error')}`);
        }
      },
    },
  );
  return { clearWishlist, isLoading };
}

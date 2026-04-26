import {
  KolshiCreateOrderInput,
  KolshiOrderHistoryEntry,
  KolshiOrderQueryOptions,
  KolshiTrackingResponse,
  Order,
  OrderPaginator,
  OrderQueryOptions,
} from '@/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { mapPaginatorData } from '@/framework/utils/data-mappers';

/* ──────────────────────────────────────────────────────────────────────
 * My Orders (G.1) — `GET /orders`
 *
 * Kolshi issues **one order per shop** at checkout (see F.3/G.4). The
 * listing endpoint is already flat, so no client-side parent/suborder
 * flattening is required; the hook mirrors the template contract so
 * existing list components keep working.
 * ──────────────────────────────────────────────────────────────────── */
export function useOrders(
  options?: Partial<KolshiOrderQueryOptions> & Partial<OrderQueryOptions>,
) {
  const formattedOptions = { ...options } as Record<string, unknown>;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<OrderPaginator, Error>(
    [API_ENDPOINTS.ORDERS, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.orders.all(Object.assign({}, queryKey[1], pageParam)),
    {
      // The raw Kolshi response (via HttpClient.get, not getPaginated) uses
      // `page` and `lastPage` — not the template's `current_page`/`last_page`.
      getNextPageParam: ({ page: currentPage, lastPage: totalPages }: any) =>
        totalPages > currentPage ? { page: currentPage + 1 } : undefined,
      refetchOnWindowFocus: false,
    },
  );

  return {
    orders: data?.pages?.flatMap((page) => page.data) ?? [],
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

/* ──────────────────────────────────────────────────────────────────────
 * Order detail (G.2) — `GET /orders/{id}`
 *
 * The template routes by `tracking_number`; Kolshi's endpoint accepts
 * both the numeric id and the tracking number. We keep the param name
 * so call sites stay unchanged.
 * ──────────────────────────────────────────────────────────────────── */
export function useOrder({ tracking_number }: { tracking_number: string }) {
  const { data, isLoading, error, isFetching, refetch } = useQuery<Order, Error>(
    [API_ENDPOINTS.ORDERS, tracking_number],
    () => client.orders.get(tracking_number),
    { refetchOnWindowFocus: false, enabled: Boolean(tracking_number) },
  );

  return {
    order: data,
    isFetching,
    isLoading,
    refetch,
    error,
  };
}

/**
 * `GET /orders/{id}/history` — audit log for an order. Feeds the
 * progress box on the order-detail page.
 */
export function useOrderHistory(id: string | number | undefined | null) {
  const { data, isLoading, error, refetch } = useQuery<
    KolshiOrderHistoryEntry[],
    Error
  >(
    [API_ENDPOINTS.ORDERS_HISTORY, id, 'history'],
    () => client.orders.history(id as string | number),
    { enabled: Boolean(id), refetchOnWindowFocus: false },
  );
  return {
    history: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * `PUT /orders/{id}/cancel` — customer-initiated cancellation, allowed
 * only while the order has not yet reached `AT_LOCAL_FACILITY`. The
 * Kolshi error payload (`{ message }`) is surfaced verbatim on failure.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  return useMutation(
    ({ id, note }: { id: string | number; note?: string }) =>
      client.orders.cancel(id, note),
    {
      onSuccess: () => {
        toast.success(t('text-order-cancelled-successfully'));
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? t('error-order-cancel-failed'),
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      },
    },
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Place order (F.3) — `POST /orders`
 *
 * Returns `List<OrderDTO>` (one row per shop in the cart). We collect
 * the tracking numbers and redirect to `/orders/order-received?ids=`
 * which fans out into one card per order. Legacy single-order flows
 * keep working because the list always has at least one element.
 * ──────────────────────────────────────────────────────────────────── */
export function usePlaceOrderMutation() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(client.orders.create, {
    onSuccess: (orders) => {
      queryClient.invalidateQueries(API_ENDPOINTS.CART);
      queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      const list = Array.isArray(orders) ? orders : [orders];
      if (!list.length) {
        toast.error(t('error-order-create-failed'));
        return;
      }
      const trackingNumbers = list
        .map((o: Order) => o?.tracking_number)
        .filter(Boolean);
      if (trackingNumbers.length > 1) {
        router.push(
          `/orders/order-received?ids=${trackingNumbers.join(',')}`,
        );
      } else if (trackingNumbers.length === 1) {
        router.push(Routes.order(trackingNumbers[0] as string));
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? t('error-order-create-failed'),
      );
    },
  });

  return { placeOrder: mutate, isLoading };
}

/**
 * Legacy alias preserved so older call sites (`useCreateOrder().createOrder(...)`)
 * keep compiling while we migrate to `usePlaceOrderMutation`.
 */
export function useCreateOrder() {
  const { placeOrder, isLoading } = usePlaceOrderMutation();
  function createOrder(input: KolshiCreateOrderInput) {
    placeOrder(input);
  }
  return { createOrder, isLoading };
}

/* ──────────────────────────────────────────────────────────────────────
 * Tracking (G.3) — `GET /tracking/{trackingNumber}?contact=`
 *
 * Public endpoint: no auth required; `contact` must match the email or
 * phone captured at checkout. The hook stays disabled until both inputs
 * are present so typing into the form doesn't spam the backend.
 * ──────────────────────────────────────────────────────────────────── */
export function usePublicTracking({
  trackingNumber,
  contact,
  enabled = true,
}: {
  trackingNumber?: string;
  contact?: string;
  enabled?: boolean;
}) {
  const query = useQuery<KolshiTrackingResponse, Error>(
    [API_ENDPOINTS.TRACKING, trackingNumber, contact],
    () => client.tracking.get(trackingNumber!, contact),
    {
      enabled: enabled && Boolean(trackingNumber && contact),
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
  return {
    tracking: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}


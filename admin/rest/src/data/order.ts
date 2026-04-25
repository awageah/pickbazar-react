import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import {
  OrderQueryOptions,
  OrderPaginator,
  Order,
  KolshiOrderNote,
  KolshiOrderHistoryEntry,
  KolshiPayment,
} from '@/types';
import { orderClient } from './client/order';
import { normalizeApiError } from '@/utils/error-handler';

// ── List / detail ─────────────────────────────────────────────────────────────

export const useOrdersQuery = (
  params: Partial<OrderQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<OrderPaginator, Error>(
    [API_ENDPOINTS.ORDERS, params],
    ({ queryKey, pageParam }) =>
      orderClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)),
    { keepPreviousData: true, ...options },
  );
  return {
    orders: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useOrderQuery = ({ id }: { id: string; language?: string }) => {
  const { data, error, isLoading } = useQuery<Order, Error>(
    [API_ENDPOINTS.ORDERS, { id }],
    () => orderClient.get({ id }),
    { enabled: Boolean(id) },
  );
  return { order: data, error, isLoading };
};

// ── Status transitions ────────────────────────────────────────────────────────

/** Advance to the next status in the Kolshi state machine. */
export const useAdvanceOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ id, newStatus }: { id: string | number; newStatus: string }) =>
      orderClient.advanceStatus(id, newStatus),
    {
      onSuccess: (_, { id }) => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS, { id: String(id) }]);
        queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    (id: string | number) => orderClient.cancel(id),
    {
      onSuccess: (_, id) => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS, { id: String(id) }]);
        queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ id, status, note }: { id: string | number; status: string; note?: string }) =>
      orderClient.updateStatus(id, status, note),
    {
      onSuccess: (_, { id }) => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS, { id: String(id) }]);
        queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

// ── Order notes ───────────────────────────────────────────────────────────────

export const useOrderNotesQuery = (orderId: string | number) => {
  const { data, error, isLoading } = useQuery<KolshiOrderNote[], Error>(
    [API_ENDPOINTS.ORDER_NOTES, orderId],
    () => orderClient.getNotes(orderId),
    { enabled: Boolean(orderId) },
  );
  return { notes: data ?? [], error, isLoading };
};

export const useAddOrderNoteMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({
      orderId,
      note,
      customer_visible = false,
    }: {
      orderId: string | number;
      note: string;
      customer_visible?: boolean;
    }) => orderClient.addNote(orderId, { note, customer_visible }),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries([API_ENDPOINTS.ORDER_NOTES, orderId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useDeleteOrderNoteMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ orderId, noteId }: { orderId: string | number; noteId: number }) =>
      orderClient.deleteNote(orderId, noteId),
    {
      onSuccess: (_, { orderId }) => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries([API_ENDPOINTS.ORDER_NOTES, orderId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

// ── Order history ─────────────────────────────────────────────────────────────

export const useOrderHistoryQuery = (id: string | number) => {
  const { data, error, isLoading } = useQuery<KolshiOrderHistoryEntry[], Error>(
    [API_ENDPOINTS.ORDER_STATUS, id],
    () => orderClient.getHistory(id),
    { enabled: Boolean(id) },
  );
  return { history: data ?? [], error, isLoading };
};

// ── Payments / refunds ────────────────────────────────────────────────────────

export const useOrderPaymentQuery = (orderId: string | number) => {
  const { data, error, isLoading } = useQuery<KolshiPayment[], Error>(
    [API_ENDPOINTS.DOWNLOAD_INVOICE, orderId],
    () => orderClient.getPayment(orderId),
    { enabled: Boolean(orderId) },
  );
  return { payments: data ?? [], error, isLoading };
};

export const useRefundMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ paymentId, reason }: { paymentId: number; reason: string; orderId: string }) =>
      orderClient.refund(paymentId, reason),
    {
      onSuccess: (_, { orderId }) => {
        toast.success('Refund initiated successfully.');
        queryClient.invalidateQueries([API_ENDPOINTS.DOWNLOAD_INVOICE, orderId]);
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS, { id: orderId }]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

// ── Stub hooks (compile-compat until A9) ─────────────────────────────────────

/** @deprecated Admin order creation is not supported in Kolshi. */
export function useCreateOrderMutation() {
  return {
    createOrder: () => {
      toast.error('Admin order creation is not supported in Kolshi.');
    },
    isLoading: false,
  };
}

/** @deprecated Invoice download replaced by order detail view. */
export const useDownloadInvoiceMutation = (_args: any, _options?: any) => ({
  refetch: async () => ({ data: null }),
});

/** @deprecated Replaced by useAdvanceOrderStatusMutation. */
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation(
    ({ id, order_status }: { id: string; order_status: string }) =>
      orderClient.updateStatus(id, order_status),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

/** @deprecated No notification reads in Kolshi — no-op. */
export function useOrderSeen() {
  return {
    readOrderNotice: () => {},
    isLoading: false,
    isSuccess: true,
  };
}

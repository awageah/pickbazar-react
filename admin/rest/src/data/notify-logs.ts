import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import { notifyClient } from '@/data/client/notify-logs';
import { KolshiAdminNotification, KolshiNotificationStats } from '@/types';
import { normalizeApiError } from '@/utils/error-handler';

// ── Admin: failed notifications ───────────────────────────────────────────────

export const useAdminFailedNotificationsQuery = (
  params: { page?: number; limit?: number } = {},
  opts: any = {},
) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.ADMIN_NOTIFICATIONS_FAILED, params],
    () => notifyClient.failed(params),
    { keepPreviousData: true, ...opts },
  );
  return {
    notifications: (data as any)?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    error,
    loading: isLoading,
  };
};

// ── Admin: dead-letter queue ──────────────────────────────────────────────────

export const useAdminDeadLetterQuery = (
  params: { page?: number; limit?: number } = {},
  opts: any = {},
) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.ADMIN_NOTIFICATIONS_DEAD_LETTER, params],
    () => notifyClient.deadLetter(params),
    { keepPreviousData: true, ...opts },
  );
  return {
    notifications: (data as any)?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    error,
    loading: isLoading,
  };
};

// ── Admin: notification stats ─────────────────────────────────────────────────

export const useAdminNotificationStatsQuery = (opts: any = {}) => {
  const { data, error, isLoading } = useQuery<KolshiNotificationStats, Error>(
    [API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS],
    notifyClient.stats,
    { staleTime: 30_000, retry: 1, ...opts },
  );
  return { stats: data ?? null, error, loading: isLoading };
};

// ── Admin: retry failed notification ─────────────────────────────────────────

export const useRetryNotificationMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(({ id }: { id: number }) => notifyClient.retry(id), {
    onSuccess: () => {
      toast.success('Retry queued');
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Retry failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_NOTIFICATIONS_FAILED);
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS);
    },
  });
};

// ── Legacy compat stubs (keep compile-compat until A9 cleanup) ───────────────

/** @deprecated */
export const useNotifyLogsQuery = (
  _params: any = {},
  _opts: any = {},
) => ({ notifyLogs: [], paginatorInfo: null, error: null, loading: false });

/** @deprecated */
export const useDeleteNotifyLogMutation = () =>
  useMutation(notifyClient.delete as any);

/** @deprecated */
export const useNotifyLogReadMutation = () =>
  useMutation(notifyClient.notifyLogSeen as any);

/** @deprecated */
export const useNotifyLogAllReadMutation = () =>
  useMutation(notifyClient.readAllNotifyLogs as any);

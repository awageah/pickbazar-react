import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { WithdrawQueryOptions, WithdrawPaginator, Withdraw } from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { withdrawClient } from './client/withdraw';
import { normalizeApiError } from '@/utils/error-handler';

export const useCreateWithdrawMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation(withdrawClient.create, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      router.push(`/${router.query.shop}/withdraws`);
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WITHDRAWS);
    },
  });
};

export const useApproveWithdrawMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(withdrawClient.approve, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WITHDRAWS);
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_WITHDRAWALS_PENDING);
    },
  });
};

export const useRejectWithdrawMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, rejectionReason }: { id: string | number; rejectionReason: string }) =>
      withdrawClient.reject({ id, rejectionReason }),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
      },
      onError: (error: any) => {
        toast.error(normalizeApiError(error)?.message ?? 'Request failed');
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.WITHDRAWS);
        queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_WITHDRAWALS_PENDING);
      },
    },
  );
};

export const useWithdrawQuery = ({ id }: { id: string }) => {
  const { data, error, isLoading } = useQuery<Withdraw, Error>(
    [API_ENDPOINTS.WITHDRAWS, { id }],
    () => withdrawClient.get({ id }),
    { enabled: Boolean(id) },
  );
  return { withdraw: data, error, isLoading };
};

export const useWithdrawsQuery = (
  params: Partial<WithdrawQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<WithdrawPaginator, Error>(
    [API_ENDPOINTS.WITHDRAWS, params],
    ({ queryKey, pageParam }) =>
      withdrawClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)),
    { keepPreviousData: true, ...options },
  );
  return {
    withdraws: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

/** Admin-only: paginated queue of PENDING withdrawals. */
export const usePendingWithdrawsQuery = (
  params: { page?: number; limit?: number } = {},
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.ADMIN_WITHDRAWALS_PENDING, params],
    () => withdrawClient.paginatedPending(params),
    { keepPreviousData: true, ...options },
  );
  return {
    withdraws: (data as any)?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    error,
    loading: isLoading,
  };
};

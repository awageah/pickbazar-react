import Router, { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { couponClient } from './client/coupon';
import { Coupon, CouponPaginator, CouponQueryOptions } from '@/types';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import { normalizeApiError } from '@/utils/error-handler';

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation(couponClient.create, {
    onSuccess: async () => {
      await Router.push(Routes.coupon.list);
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.COUPONS);
    },
  });
};

export const useDeleteCouponMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(couponClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.COUPONS);
    },
  });
};

export const useUpdateCouponMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(couponClient.update, {
    onSuccess: async () => {
      await router.push(Routes.coupon.list);
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.COUPONS);
    },
  });
};

export const useVerifyCouponMutation = () => {
  return useMutation(couponClient.verify);
};

export const useCouponQuery = ({ code }: { code: string; language?: string }) => {
  const { data, error, isLoading } = useQuery<Coupon, Error>(
    [API_ENDPOINTS.COUPONS, { code }],
    () => couponClient.get({ code }),
    { enabled: Boolean(code) },
  );
  return { coupon: data, error, loading: isLoading };
};

export const useCouponsQuery = (options: Partial<CouponQueryOptions>) => {
  const { data, error, isLoading } = useQuery<CouponPaginator, Error>(
    [API_ENDPOINTS.COUPONS, options],
    ({ queryKey, pageParam }) =>
      couponClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)),
    { keepPreviousData: true },
  );
  return {
    coupons: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

/** Admin: paginated usage history for a coupon. */
export const useCouponUsagesQuery = (
  id: string | number,
  page = 1,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.COUPON_USAGES, id, page],
    () => couponClient.getUsages(id, page),
    { keepPreviousData: true, enabled: Boolean(id), ...options },
  );
  return {
    usages: (data as any)?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    error,
    loading: isLoading,
  };
};

/** @deprecated no-op stubs for compile compat */
export const useApproveCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(couponClient.approve, {
    onSettled: () => queryClient.invalidateQueries(API_ENDPOINTS.COUPONS),
  });
};
export const useDisApproveCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(couponClient.disapprove, {
    onSettled: () => queryClient.invalidateQueries(API_ENDPOINTS.COUPONS),
  });
};

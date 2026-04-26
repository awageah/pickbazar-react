import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { shopClient, ShopListParams } from '@/data/client/shop';
import { Shop, ShopInput } from '@/types';
import { getAuthCredentials, adminOnly, hasAccess } from '@/utils/auth-utils';
import { toPaginatorInfo } from '@/utils/pagination';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

// ── Queries ────────────────────────────────────────────────────────────────────

export const useShopQuery = ({ slug }: { slug: string }, options?: any) =>
  useQuery<Shop, Error>(
    [API_ENDPOINTS.SHOPS, { slug }],
    () => shopClient.get({ slug }),
    { enabled: Boolean(slug), ...options },
  );

export const useShopsQuery = (params: ShopListParams = {}) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.SHOPS, params],
    () => shopClient.paginated(params),
    { keepPreviousData: true },
  );
  return {
    shops: data?.data ?? [],
    paginatorInfo: toPaginatorInfo(data ?? null),
    error,
    loading: isLoading,
  };
};

/** Pending-approval queue — replaces the old `useInActiveShopsQuery`. */
export const usePendingShopsQuery = (params: ShopListParams = {}) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, params],
    () => shopClient.pendingShops(params),
    { keepPreviousData: true },
  );
  return {
    shops: data?.data ?? [],
    paginatorInfo: toPaginatorInfo(data ?? null),
    error,
    loading: isLoading,
  };
};

/** @deprecated Use usePendingShopsQuery */
export const useInActiveShopsQuery = usePendingShopsQuery;

/** Store-owner's own shops — `GET /shops/my-shops`. */
export const useMyShopsQuery = (params: ShopListParams = {}) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.MY_SHOPS, params],
    () => shopClient.myShops(params),
    { keepPreviousData: true },
  );
  return {
    shops: data?.data ?? [],
    paginatorInfo: toPaginatorInfo(data ?? null),
    error,
    loading: isLoading,
  };
};

// ── Mutations ──────────────────────────────────────────────────────────────────

export const useApproveShopMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(shopClient.approve, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('common:error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
      queryClient.invalidateQueries(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS);
    },
  });
};

export const useDisApproveShopMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(shopClient.disapprove, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('common:error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
      queryClient.invalidateQueries(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS);
    },
  });
};

export const useCreateShopMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  return useMutation(shopClient.create, {
    onSuccess: (data) => {
      toast.success(
        t('common:text-shop-created-under-review', {
          defaultValue:
            'Your shop has been submitted! Our team will review it and notify you by email once approved — this usually takes 1–2 business days.',
        }),
        { autoClose: 6000 },
      );
      const { permissions } = getAuthCredentials();
      if (hasAccess(adminOnly, permissions)) {
        return router.push(Routes.adminMyShops);
      }
      router.push(Routes.dashboard);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
    },
  });
};

export const useUpdateShopMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(shopClient.update, {
    onSuccess: async (data) => {
      await router.push(`/${data?.slug}/edit`, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('common:error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
    },
  });
};

export const useDeleteShopMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(shopClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('common:error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
    },
  });
};

/**
 * Ownership transfer is not available in Kolshi. This stub prevents TS errors
 * in pages that reference it until they are cleaned in A9.
 * @deprecated A.Delete
 */
export const useTransferShopOwnershipMutation = () => {
  const { t } = useTranslation();
  return useMutation(() => {
    toast.error(t('common:error-something-wrong'));
    return Promise.reject(new Error('Transfer ownership is not supported'));
  });
};

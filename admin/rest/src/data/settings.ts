import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { settingsClient } from './client/settings';
import { KolshiSetting, KolshiSettingsPage, KolshiCacheStats } from '@/types';
import { normalizeApiError } from '@/utils/error-handler';

/** Fetch all platform settings (paginated, public). */
export const useSettingsListQuery = (
  opts: { page?: number; size?: number } = {},
  queryOpts: any = {},
) => {
  const { data, error, isLoading } = useQuery<KolshiSettingsPage, Error>(
    [API_ENDPOINTS.SETTINGS, opts],
    () => settingsClient.list(opts),
    { keepPreviousData: true, ...queryOpts },
  );
  return {
    settings: (data as any)?.data ?? [],
    total: (data as any)?.total ?? 0,
    error,
    loading: isLoading,
  };
};

/** Fetch settings for a single category. */
export const useSettingsByCategoryQuery = (
  category: string,
  opts: any = {},
) => {
  const { data, error, isLoading } = useQuery<KolshiSetting[], Error>(
    [API_ENDPOINTS.SETTINGS, 'category', category],
    () => settingsClient.byCategory(category),
    { enabled: Boolean(category), ...opts },
  );
  return { settings: data ?? [], error, loading: isLoading };
};

/** Admin: update a single setting value by key. */
export const useUpdateSettingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(settingsClient.updateByKey, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Update failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS);
    },
  });
};

/** Admin: create a new platform setting. */
export const useCreateSettingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(settingsClient.create, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Create failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS);
    },
  });
};

/** Admin: delete a non-system setting by key. */
export const useDeleteSettingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(settingsClient.deleteByKey, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Delete failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS);
    },
  });
};

/** Admin: trigger settings cache refresh. */
export const useRefreshCacheMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(settingsClient.refreshCache, {
    onSuccess: () => {
      toast.success('Settings cache refreshed');
      queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS);
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Refresh failed');
    },
  });
};

/** Admin: cache stats. */
export const useCacheStatsQuery = (opts: any = {}) => {
  const { data, error, isLoading } = useQuery<KolshiCacheStats, Error>(
    [API_ENDPOINTS.SETTINGS_CACHE_STATS],
    settingsClient.cacheStats,
    { staleTime: 30_000, ...opts },
  );
  return { stats: data ?? null, error, loading: isLoading };
};

/**
 * Legacy compatibility hooks referenced by older components that depended
 * on the Pixer settings context. These return minimal safe values so the
 * app does not crash while the Settings page is being fully migrated.
 * @deprecated Remove in A9 cleanup.
 */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(settingsClient.update as any, {
    onSettled: () => queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS),
  });
};

export const useSettingsQuery = (_opts?: any) => {
  // Return a no-op result so callers that still use the old hook don't crash.
  return { settings: null, error: null, loading: false };
};

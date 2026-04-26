import { useMemo } from 'react';
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

/** @deprecated Remove in A9 cleanup. */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(settingsClient.update as any, {
    onSettled: () => queryClient.invalidateQueries(API_ENDPOINTS.SETTINGS),
  });
};

/**
 * Fetches all platform settings from GET /api/v1/settings and maps the flat
 * key/value rows into the legacy Settings.options shape expected by the navbar
 * and the SettingsProvider in _app.tsx.
 *
 * Error is always returned as null so a transient API failure never blocks
 * the app shell — components fall back to default values from SettingsContext.
 */
export const useSettingsQuery = (_opts?: any) => {
  const { data, isLoading } = useQuery<KolshiSettingsPage, Error>(
    [API_ENDPOINTS.SETTINGS, 'site-options'],
    () => settingsClient.list({ size: 100 }),
    { staleTime: 5 * 60_000, retry: 1 },
  );

  const settings = useMemo(() => {
    const rows: KolshiSetting[] = data?.data ?? [];
    if (!rows.length) return null;

    const kv = rows.reduce<Record<string, string>>((acc, s) => {
      acc[s.setting_key] = s.setting_value;
      return acc;
    }, {});

    let logo: any = null;
    try {
      logo = kv['logo'] ? JSON.parse(kv['logo']) : null;
    } catch {
      logo = null;
    }

    return {
      id: 'kolshi-settings',
      language: 'en',
      options: {
        siteName: kv['site_name'] ?? kv['siteName'] ?? 'Kolshi',
        siteSubtitle: kv['site_subtitle'] ?? kv['siteSubtitle'] ?? '',
        currency: kv['currency'] ?? 'EGP',
        logo,
        isUnderMaintenance:
          kv['is_under_maintenance'] === 'true' ||
          kv['isUnderMaintenance'] === 'true',
        maintenance: {
          start: kv['maintenance_start'] ?? kv['maintenanceStart'] ?? null,
          until: kv['maintenance_until'] ?? kv['maintenanceUntil'] ?? null,
        },
      },
    };
  }, [data]);

  return { settings, error: null, loading: isLoading };
};

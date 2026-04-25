import {
  KolshiSetting,
  KolshiSettingsPage,
  KolshiCacheStats,
  Settings,
  SettingsInput,
  SettingsOptionsInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const settingsClient = {
  /** GET /settings — public paginated list of all settings. */
  list: ({ page = 1, size = 100 }: { page?: number; size?: number } = {}) =>
    HttpClient.get<KolshiSettingsPage>(API_ENDPOINTS.SETTINGS, { page, size }),

  /** GET /settings/category/{category} — admin: settings by category. */
  byCategory: (category: string) =>
    HttpClient.get<KolshiSetting[]>(
      `${API_ENDPOINTS.SETTINGS}/category/${category}`,
    ),

  /** PUT /settings/{key} { newValue } — admin: update a setting. */
  updateByKey: ({
    key,
    newValue,
  }: {
    key: string;
    newValue: string;
  }) =>
    HttpClient.put<KolshiSetting>(
      `${API_ENDPOINTS.SETTINGS}/${key}`,
      { newValue },
    ),

  /** POST /settings — admin: create a new setting. */
  create: (input: Partial<KolshiSetting>) =>
    HttpClient.post<KolshiSetting>(API_ENDPOINTS.SETTINGS, input),

  /** DELETE /settings/{key} — admin: delete a non-system setting (204). */
  deleteByKey: (key: string) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.SETTINGS}/${key}`),

  /** POST /settings/cache/refresh — reload settings from DB. */
  refreshCache: () =>
    HttpClient.post<void>(API_ENDPOINTS.SETTINGS_CACHE_REFRESH, null),

  /** GET /settings/cache/stats */
  cacheStats: () =>
    HttpClient.get<KolshiCacheStats>(API_ENDPOINTS.SETTINGS_CACHE_STATS),

  // ── Legacy compat shims (kept so any lingering call site compiles) ───────

  /** @deprecated use list() */
  all: (_opts?: any) =>
    HttpClient.get<KolshiSettingsPage>(API_ENDPOINTS.SETTINGS, {
      page: 1,
      size: 100,
    }),

  /** @deprecated no-op — Kolshi settings are key/value; use updateByKey */
  update: (_data: SettingsInput) => Promise.resolve(null as any),
};

import {
  KolshiAdminNotification,
  KolshiNotificationStats,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const notifyClient = {
  // ── Admin notification management (J14–J17) ───────────────────────────────

  /** GET /admin/notifications/failed — paginated failed notifications. */
  failed: ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) =>
    HttpClient.getPaginated<KolshiAdminNotification>(
      API_ENDPOINTS.ADMIN_NOTIFICATIONS_FAILED,
      { page, size: limit },
    ),

  /** GET /admin/notifications/dead-letter — paginated dead-letter queue. */
  deadLetter: ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) =>
    HttpClient.getPaginated<KolshiAdminNotification>(
      API_ENDPOINTS.ADMIN_NOTIFICATIONS_DEAD_LETTER,
      { page, size: limit },
    ),

  /** GET /admin/notifications/stats */
  stats: () =>
    HttpClient.get<KolshiNotificationStats>(API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS),

  /** POST /admin/notifications/{id}/retry */
  retry: (id: number) =>
    HttpClient.post<void>(`admin/notifications/${id}/retry`, null),

  // ── User notifications (J18–J20) ─────────────────────────────────────────

  /** GET /notifications — paginated user notifications. */
  paginated: ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) =>
    HttpClient.getPaginated<KolshiAdminNotification>(
      API_ENDPOINTS.NOTIFY_LOGS,
      { page, size: limit },
    ),

  /** @deprecated no-op stubs kept for compile compat */
  notifyLogSeen: (_input: any) => Promise.resolve(),
  readAllNotifyLogs: (_params: any) => Promise.resolve(),

  /** @deprecated use failed() or deadLetter() */
  get: (_opts: any) =>
    HttpClient.get<KolshiAdminNotification[]>(API_ENDPOINTS.ADMIN_NOTIFICATIONS_FAILED),

  /** @deprecated */
  delete: (_v: any) => Promise.resolve(),
  create: (_v: any) => Promise.resolve(null as any),
  update: (_v: any) => Promise.resolve(null as any),
  getAll: (_v: any) => Promise.resolve([] as any),
};

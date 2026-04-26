import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import type { KolshiPageResponse } from '@/utils/pagination';
import type {
  Shop,
  Order,
  User,
  KolshiAdminOverview,
  KolshiShopAnalytics,
  KolshiSystemStatus,
  KolshiNotificationStats,
} from '@/types';

export interface DashboardStats {
  pendingShopsCount: number;
  totalOrdersCount: number;
  totalUsersCount: number;
}

export const dashboardClient = {
  // ── KPI count queries (page 0, size 1 → read total) ──────────────────────

  pendingShopsCount: () =>
    HttpClient.get<KolshiPageResponse<Shop>>(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, {
      page: 0,
      size: 1,
    }),

  ordersCount: () =>
    HttpClient.get<KolshiPageResponse<Order>>(API_ENDPOINTS.ORDERS, {
      page: 0,
      size: 1,
    }),

  usersCount: () =>
    HttpClient.get<KolshiPageResponse<User>>(API_ENDPOINTS.USERS, {
      page: 0,
      size: 1,
    }),

  pendingWithdrawalsCount: () =>
    HttpClient.get<KolshiPageResponse<any>>(API_ENDPOINTS.WITHDRAWS, {
      page: 0,
      size: 1,
      status: 'PENDING',
    }),

  // ── Platform analytics overview (super_admin) ────────────────────────────

  /** GET /analytics/overview */
  analyticsOverview: (params?: { start_date?: string; end_date?: string }) =>
    HttpClient.get<KolshiAdminOverview>(API_ENDPOINTS.ANALYTICS_OVERVIEW, params ?? {}),

  // ── Shop analytics ────────────────────────────────────────────────────────

  /** GET /analytics/shops/{shopId}?days=30 */
  shopAnalytics: (shopId: number | string, days = 30) =>
    HttpClient.get<KolshiShopAnalytics>(
      `analytics/shops/${shopId}`,
      { days },
    ),

  // ── System status ─────────────────────────────────────────────────────────

  /** GET /system/status — super_admin only. */
  systemStatus: () =>
    HttpClient.get<KolshiSystemStatus>(API_ENDPOINTS.SYSTEM_STATUS),

  // ── Admin notification stats ──────────────────────────────────────────────

  /** GET /admin/notifications/stats */
  notificationStats: () =>
    HttpClient.get<KolshiNotificationStats>(API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS),
};

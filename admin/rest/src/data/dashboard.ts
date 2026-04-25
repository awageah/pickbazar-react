/**
 * Dashboard data hooks — A4 (extended in A8).
 *
 * Super-admin KPIs: derived from queue endpoints (pending shops, orders,
 * users, pending withdrawals). System status + notification stats added in A8.
 * Store-owner analytics: GET /analytics/shops/{id}?days=30 added in A8.
 */
import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { dashboardClient } from '@/data/client/dashboard';
import {
  KolshiShopAnalytics,
  KolshiSystemStatus,
  KolshiNotificationStats,
} from '@/types';

// ── Super-admin KPI counts ────────────────────────────────────────────────────

export function usePendingShopsCountQuery() {
  return useQuery(
    [API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, 'count'],
    dashboardClient.pendingShopsCount,
    { staleTime: 30_000 },
  );
}

export function useOrdersCountQuery() {
  return useQuery(
    [API_ENDPOINTS.ORDERS, 'count'],
    dashboardClient.ordersCount,
    { staleTime: 30_000 },
  );
}

export function useUsersCountQuery() {
  return useQuery(
    [API_ENDPOINTS.USERS, 'count'],
    dashboardClient.usersCount,
    { staleTime: 60_000 },
  );
}

export function usePendingWithdrawalsCountQuery() {
  return useQuery(
    [API_ENDPOINTS.WITHDRAWS, 'pending-count'],
    dashboardClient.pendingWithdrawalsCount,
    { staleTime: 30_000 },
  );
}

// ── Store-owner shop analytics ────────────────────────────────────────────────

/**
 * GET /analytics/shops/{shopId}?days=30
 * Required by the owner dashboard for revenue / order charts.
 */
export function useShopAnalyticsQuery(
  shopId: number | string | undefined,
  days = 30,
  opts: any = {},
) {
  const { data, error, isLoading } = useQuery<KolshiShopAnalytics, Error>(
    [API_ENDPOINTS.SHOP_ANALYTICS, shopId, days],
    () => dashboardClient.shopAnalytics(shopId!, days),
    { enabled: Boolean(shopId), staleTime: 60_000, ...opts },
  );
  return { analytics: data ?? null, error, loading: isLoading };
}

// ── System status ─────────────────────────────────────────────────────────────

export function useSystemStatusQuery(opts: any = {}) {
  const { data, error, isLoading } = useQuery<KolshiSystemStatus, Error>(
    [API_ENDPOINTS.SYSTEM_STATUS],
    dashboardClient.systemStatus,
    { staleTime: 60_000, retry: 1, ...opts },
  );
  return { status: data ?? null, error, loading: isLoading };
}

// ── Admin notification stats ──────────────────────────────────────────────────

export function useNotificationStatsQuery(opts: any = {}) {
  const { data, error, isLoading } = useQuery<KolshiNotificationStats, Error>(
    [API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS],
    dashboardClient.notificationStats,
    { staleTime: 30_000, retry: 1, ...opts },
  );
  return { stats: data ?? null, error, loading: isLoading };
}

// ── Deprecated stubs (A9 cleanup target) ─────────────────────────────────────

/** @deprecated */
export const useAnalyticsQuery = () =>
  useQuery(['__noop__analytics'], () => null, { enabled: false });
/** @deprecated */
export const usePopularProductsQuery = () => ({ data: [], isLoading: false });
/** @deprecated */
export const useLowProductStockQuery = () => ({ data: [], isLoading: false });
/** @deprecated */
export const useProductByCategoryQuery = () => ({
  data: null,
  isLoading: false,
  error: null,
});
/** @deprecated */
export const useTopRatedProductsQuery = () => ({
  data: [],
  isLoading: false,
  error: null,
});
/** @deprecated */
export const useMostSoldProductByCategoryQuery = () => ({
  data: [],
  isLoading: false,
});

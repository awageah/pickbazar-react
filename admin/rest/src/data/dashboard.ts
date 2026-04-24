/**
 * Dashboard data hooks — A4.
 *
 * Kolshi has no platform-wide analytics endpoint. KPIs are derived from
 * individual queue endpoints (pending shops, orders count, users count,
 * pending withdrawals). Each query fetches page 0 / size 1 and reads the
 * `total` field from the PageResponse to get the count.
 */
import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { dashboardClient } from '@/data/client/dashboard';

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

/**
 * Stubs for hooks still referenced by the admin.tsx dashboard template
 * while it is being rewritten. These hooks return empty / null so the
 * component can conditionally render nothing without throwing.
 * @deprecated Remove in A9 cleanup.
 */
export const useAnalyticsQuery = () => useQuery(['__noop__analytics'], () => null, { enabled: false });
export const usePopularProductsQuery = () => ({ data: [], isLoading: false });
export const useLowProductStockQuery = () => ({ data: [], isLoading: false });
export const useProductByCategoryQuery = () => ({ data: null, isLoading: false });
export const useTopRatedProductsQuery = () => ({ data: [], isLoading: false });
export const useMostSoldProductByCategoryQuery = () => ({ data: [], isLoading: false });

import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import type { KolshiPageResponse } from '@/utils/pagination';
import type { Shop, Order, User } from '@/types';

export interface DashboardStats {
  pendingShopsCount: number;
  totalOrdersCount: number;
  totalUsersCount: number;
}

export const dashboardClient = {
  /**
   * GET /shops/pending?page=0&size=1
   * We only need the total count; fetch page 0, size 1 and read `total`.
   */
  pendingShopsCount: () =>
    HttpClient.get<KolshiPageResponse<Shop>>(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, {
      page: 0,
      size: 1,
    }),

  /**
   * GET /orders?page=0&size=1 — total order count for the dashboard KPI.
   */
  ordersCount: () =>
    HttpClient.get<KolshiPageResponse<Order>>(API_ENDPOINTS.ORDERS, {
      page: 0,
      size: 1,
    }),

  /**
   * GET /users?page=0&size=1 — total user count for the dashboard KPI.
   */
  usersCount: () =>
    HttpClient.get<KolshiPageResponse<User>>(API_ENDPOINTS.USERS, {
      page: 0,
      size: 1,
    }),

  /**
   * GET /withdrawals?page=0&size=1&status=PENDING — pending withdrawal count.
   * Kolshi supports status filter on the withdrawals list.
   */
  pendingWithdrawalsCount: () =>
    HttpClient.get<KolshiPageResponse<any>>(API_ENDPOINTS.WITHDRAWS, {
      page: 0,
      size: 1,
      status: 'PENDING',
    }),
};

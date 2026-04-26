import {
  Order,
  OrderPaginator,
  OrderQueryOptions,
  KolshiOrderNote,
  KolshiOrderHistoryEntry,
  KolshiPayment,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Kolshi status → URL segment for PUT /orders/{id}/{segment}. */
const STATUS_SEGMENT: Record<string, string> = {
  PROCESSING: 'processing',
  AT_LOCAL_FACILITY: 'at-local-facility',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  COMPLETED: 'completed',
};

export const orderClient = {
  // ── List / detail ────────────────────────────────────────────────────────

  /**
   * GET /orders — Spring-paginated.
   * Kolshi params: trackingNumber, customerId, shopId, search, statuses[],
   * paymentStatuses[], startDate, endDate, orderBy, sortedBy, page, limit.
   */
  paginated: ({
    tracking_number,
    shop_id,
    page = 1,
    limit = 20,
    ...rest
  }: Partial<OrderQueryOptions>) =>
    HttpClient.getPaginated<Order>(API_ENDPOINTS.ORDERS, {
      trackingNumber: tracking_number,
      shopId: shop_id,
      ...rest,
      page,
      limit,
    }),

  /** GET /orders/{id} */
  get: ({ id }: { id: string; language?: string }) =>
    HttpClient.get<Order>(`${API_ENDPOINTS.ORDERS}/${id}`),

  // ── Status transitions ────────────────────────────────────────────────────

  /**
   * PUT /orders/{id}/{segment} for status-specific endpoints.
   * Uses the STATUS_SEGMENT map to resolve the URL path.
   */
  advanceStatus: (id: string | number, newStatus: string) => {
    const segment = STATUS_SEGMENT[newStatus];
    if (!segment) throw new Error(`Unknown status transition: ${newStatus}`);
    return HttpClient.put<Order>(`${API_ENDPOINTS.ORDERS}/${id}/${segment}`, {});
  },

  /** PUT /orders/{id}/cancel */
  cancel: (id: string | number) =>
    HttpClient.put<Order>(`${API_ENDPOINTS.ORDERS}/${id}/cancel`, {}),

  /**
   * PUT /orders/{id}/status?status=PROCESSING&note=...
   * Generic status update — used by super_admin for out-of-band transitions.
   */
  updateStatus: (id: string | number, status: string, note?: string) =>
    HttpClient.put<Order>(
      `${API_ENDPOINTS.ORDERS}/${id}/status`,
      null,
      { params: { status, note } },
    ),

  // ── Notes ─────────────────────────────────────────────────────────────────

  /** GET /orders/{orderId}/notes?customerView=false */
  getNotes: (orderId: string | number) =>
    HttpClient.get<KolshiOrderNote[]>(
      `${API_ENDPOINTS.ORDERS}/${orderId}/notes`,
      { customerView: false },
    ),

  /** POST /orders/{orderId}/notes */
  addNote: (
    orderId: string | number,
    data: { note: string; customer_visible?: boolean },
  ) =>
    HttpClient.post<KolshiOrderNote>(
      `${API_ENDPOINTS.ORDERS}/${orderId}/notes`,
      data,
    ),

  /** DELETE /orders/{orderId}/notes/{noteId} */
  deleteNote: (orderId: string | number, noteId: number) =>
    HttpClient.delete<void>(
      `${API_ENDPOINTS.ORDERS}/${orderId}/notes/${noteId}`,
    ),

  // ── History ───────────────────────────────────────────────────────────────

  /** GET /orders/{id}/history */
  getHistory: (id: string | number) =>
    HttpClient.get<KolshiOrderHistoryEntry[]>(`orders/${id}/history`),

  // ── Payments ──────────────────────────────────────────────────────────────

  /** GET /payments/order/{orderId} */
  getPayment: (orderId: string | number) =>
    HttpClient.get<KolshiPayment[]>(`payments/order/${orderId}`),

  /** POST /payments/{paymentId}/refund?reason=... */
  refund: (paymentId: number, reason: string) => {
    const url = `payments/${paymentId}/refund?reason=${encodeURIComponent(reason)}`;
    return HttpClient.post<void>(url, null);
  },
};

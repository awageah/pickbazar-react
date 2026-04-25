import {
  Coupon,
  CouponInput,
  CouponPaginator,
  CouponQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const couponClient = {
  /** GET /coupons — paginated admin list. */
  paginated: ({ code, page = 1, limit = 20, ...rest }: Partial<CouponQueryOptions>) =>
    HttpClient.getPaginated<Coupon>(API_ENDPOINTS.COUPONS, {
      search: code,
      page,
      size: limit,
      ...rest,
    }),

  /** GET /coupons/{code} — public lookup by coupon code string. */
  get: ({ code }: { code: string; language?: string }) =>
    HttpClient.get<Coupon>(`${API_ENDPOINTS.COUPONS}/${code}`),

  /** GET /coupons/{id} — admin lookup by numeric ID. */
  getById: (id: string | number) =>
    HttpClient.get<Coupon>(`${API_ENDPOINTS.COUPONS}/${id}`),

  /** POST /coupons */
  create: (input: CouponInput) =>
    HttpClient.post<Coupon>(API_ENDPOINTS.COUPONS, input),

  /** PUT /coupons/{id} */
  update: ({ id, ...input }: Partial<CouponInput> & { id: string | number }) =>
    HttpClient.put<Coupon>(`${API_ENDPOINTS.COUPONS}/${id}`, input),

  /** DELETE /coupons/{id} — returns 204 */
  delete: ({ id }: { id: string | number }) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.COUPONS}/${id}`),

  /** GET /coupons/{id}/usages — admin usage history. */
  getUsages: (id: string | number, page = 1, limit = 20) =>
    HttpClient.getPaginated<any>(`coupons/${id}/usages`, { page, size: limit }),

  /** POST /coupons/validate — verify coupon against an order amount. */
  verify: ({ code, orderAmount }: { code: string; orderAmount?: number }) =>
    HttpClient.post<Coupon>(API_ENDPOINTS.APPROVE_COUPON, {
      code,
      orderAmount,
    }),

  /** @deprecated approve/disapprove not used in Kolshi — no-ops. */
  approve: (_v: { id: string }) => Promise.resolve(),
  disapprove: (_v: { id: string }) => Promise.resolve(),
};

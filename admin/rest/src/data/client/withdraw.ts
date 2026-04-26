import {
  Withdraw,
  WithdrawPaginator,
  WithdrawQueryOptions,
  CreateWithdrawInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const withdrawClient = {
  /** GET /withdrawals — store_owner sees own; admin sees all. */
  paginated: ({ shop_id, page = 1, limit = 10, ...rest }: Partial<WithdrawQueryOptions>) =>
    HttpClient.getPaginated<Withdraw>(API_ENDPOINTS.WITHDRAWS, {
      shopId: shop_id,
      page,
      limit,
      ...rest,
    }),

  /** GET /admin/withdrawals/pending — admin pending queue. */
  paginatedPending: ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) =>
    HttpClient.getPaginated<Withdraw>(API_ENDPOINTS.ADMIN_WITHDRAWALS_PENDING, {
      page,
      limit,
    }),

  /** GET /withdrawals/{id} */
  get: ({ id }: { id: string }) =>
    HttpClient.get<Withdraw>(`${API_ENDPOINTS.WITHDRAWS}/${id}`),

  /** POST /withdrawals — store_owner creates withdrawal request. */
  create: (data: Partial<CreateWithdrawInput>) =>
    HttpClient.post<Withdraw>(API_ENDPOINTS.WITHDRAWS, data),

  /** PUT /admin/withdrawals/{id}/approve */
  approve: ({ id }: { id: string | number }) =>
    HttpClient.put<Withdraw>(`admin/withdrawals/${id}/approve`, null),

  /** PUT /admin/withdrawals/{id}/reject — requires rejectionReason (min 10 chars). */
  reject: ({ id, rejectionReason }: { id: string | number; rejectionReason: string }) =>
    HttpClient.put<Withdraw>(`admin/withdrawals/${id}/reject`, { rejectionReason }),
};

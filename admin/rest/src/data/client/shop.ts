import { Shop, ShopInput, ShopQueryOptions } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import type { CallerPageParams, KolshiPageResponse } from '@/utils/pagination';

export interface ShopListParams extends CallerPageParams {
  search?: string;
  isActive?: boolean;
}

export const shopClient = {
  /** GET /shops/slug/{slug} */
  get: ({ slug }: { slug: string }) =>
    HttpClient.get<Shop>(`${API_ENDPOINTS.SHOPS}/slug/${slug}`),

  /** GET /shops (paginated, admin) */
  paginated: ({ search, ...rest }: ShopListParams = {}) =>
    HttpClient.getPaginated<Shop>(API_ENDPOINTS.SHOPS, {
      ...(search ? { search } : {}),
      ...rest,
    }),

  /** GET /shops/pending (paginated) */
  pendingShops: (params: CallerPageParams = {}) =>
    HttpClient.getPaginated<Shop>(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, params),

  /** GET /shops/my-shops (paginated, store_owner-scoped server-side) */
  myShops: (params: CallerPageParams = {}) =>
    HttpClient.getPaginated<Shop>(API_ENDPOINTS.MY_SHOPS, params),

  /** POST /shops */
  create: (input: ShopInput) =>
    HttpClient.post<Shop>(API_ENDPOINTS.SHOPS, input),

  /** PUT /shops/{id} */
  update: ({ id, ...input }: ShopInput & { id: string }) =>
    HttpClient.put<Shop>(`${API_ENDPOINTS.SHOPS}/${id}`, input),

  /** DELETE /shops/{id} */
  delete: ({ id }: { id: string }) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.SHOPS}/${id}`),

  /** POST /shops/{id}/approve — Kolshi approve needs no commission payload */
  approve: ({ id }: { id: string }) =>
    HttpClient.post<Shop>(`${API_ENDPOINTS.SHOPS}/${id}/approve`, {}),

  /** POST /shops/{id}/disapprove */
  disapprove: ({ id }: { id: string }) =>
    HttpClient.post<Shop>(`${API_ENDPOINTS.SHOPS}/${id}/disapprove`, {}),
};

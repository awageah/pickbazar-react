import { Review, ReviewPaginator, ReviewQueryOptions, ReviewResponse } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const reviewClient = {
  /** GET /reviews/product/{productId} — paginated public product reviews. */
  byProduct: ({
    productId,
    page = 1,
    limit = 15,
    ...rest
  }: {
    productId?: string | number;
    page?: number;
    limit?: number;
    [key: string]: any;
  }) => {
    if (!productId) {
      return HttpClient.getPaginated<Review>(API_ENDPOINTS.REVIEWS, {
        page,
        limit,
        ...rest,
      });
    }
    return HttpClient.getPaginated<Review>(
      `${API_ENDPOINTS.REVIEWS}/product/${productId}`,
      { page, limit, ...rest },
    );
  },

  /** GET /reviews — paginated (fallback for admin without productId filter). */
  paginated: ({
    shop_id,
    product_id,
    page = 1,
    limit = 15,
    ...rest
  }: Partial<ReviewQueryOptions>) => {
    if (product_id) {
      return HttpClient.getPaginated<Review>(
        `${API_ENDPOINTS.REVIEWS}/product/${product_id}`,
        { page, limit, ...rest },
      );
    }
    return HttpClient.getPaginated<Review>(API_ENDPOINTS.REVIEWS, {
      shopId: shop_id,
      page,
      limit,
      ...rest,
    });
  },

  /** GET /reviews/{id} */
  get: ({ id }: { id: string }) =>
    HttpClient.get<Review>(`${API_ENDPOINTS.REVIEWS}/${id}`),

  /** DELETE /reviews/{id} — super_admin or own review. Returns 204. */
  delete: ({ id }: { id: string | number }) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.REVIEWS}/${id}`),

  // ── Review responses (store_owner) ──────────────────────────────────────

  /** GET /reviews/{reviewId}/response */
  getResponse: (reviewId: string | number) =>
    HttpClient.get<ReviewResponse | null>(`reviews/${reviewId}/response`),

  /** POST /reviews/{reviewId}/response { response: "..." } */
  addResponse: (reviewId: string | number, response: string) =>
    HttpClient.post<ReviewResponse>(`reviews/${reviewId}/response`, { response }),

  /** DELETE /reviews/responses/{responseId} — store_owner. */
  deleteResponse: (responseId: number) =>
    HttpClient.delete<void>(`reviews/responses/${responseId}`),

  /** @deprecated — no abuse-report flow in Kolshi; kept for compile compat. */
  reportAbuse: (_data: any) => Promise.resolve(),
  decline: (_data: any) => Promise.resolve(),
};

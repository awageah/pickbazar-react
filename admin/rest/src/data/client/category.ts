import { Category, CategoryPaginator, CategoryQueryOptions, CreateCategoryInput } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import { toPaginatorInfo } from '@/utils/pagination';

export interface KolshiCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parent_id?: number | null;
}

export const categoryClient = {
  /**
   * GET /categories?search=&page=0&size=10
   * Returns Kolshi PageResponse<Category> → mapped to CategoryPaginator shape.
   */
  paginated: ({ name, page = 1, limit = 10, ...rest }: Partial<CategoryQueryOptions>) =>
    HttpClient.getPaginated<Category>(API_ENDPOINTS.CATEGORIES, {
      search: name,
      ...rest,
      page,
      size: limit,
    }),

  /** GET /categories/slug/{slug} */
  get: ({ slug }: { slug: string; language?: string }) =>
    HttpClient.get<Category>(`${API_ENDPOINTS.CATEGORIES}/slug/${slug}`),

  /** GET /categories/{id} */
  getById: (id: string | number) =>
    HttpClient.get<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`),

  /** POST /categories */
  create: (data: KolshiCategoryInput) =>
    HttpClient.post<Category>(API_ENDPOINTS.CATEGORIES, data),

  /** PUT /categories/{id} */
  update: ({ id, ...data }: KolshiCategoryInput & { id: string | number }) =>
    HttpClient.put<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`, data),

  /** DELETE /categories/{id} */
  delete: ({ id }: { id: string }) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.CATEGORIES}/${id}`),
};

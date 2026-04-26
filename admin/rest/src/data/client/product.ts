import {
  Product,
  ProductPaginator,
  ProductQueryOptions,
  KolshiProductInput,
  KolshiProductImage,
  KolshiProductImageInput,
  KolshiVariation,
  KolshiVariationInput,
  ProductImportResult,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const productClient = {
  // ── List / detail ────────────────────────────────────────────────────────

  /**
   * GET /products — Spring-paginated.
   * Kolshi query params: shopId, categoryId, search, isActive, inStock,
   * sortBy, minPrice, maxPrice, language, page(0-indexed), size.
   */
  paginated: ({
    name,
    shop_id,
    status,
    categories,
    page = 1,
    limit = 10,
    ...rest
  }: Partial<ProductQueryOptions>) =>
    HttpClient.getPaginated<Product>(API_ENDPOINTS.PRODUCTS, {
      search: name,
      shopId: shop_id,
      isActive: status === 'publish' ? true : status === 'draft' ? false : undefined,
      categoryId: categories,
      ...rest,
      page,
      limit,
    }),

  /** GET /products/slug/{slug} */
  get: ({ slug }: { slug: string; language?: string }) =>
    HttpClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/slug/${slug}`),

  /** GET /products/{id} */
  getById: (id: string | number) =>
    HttpClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`),

  // ── CRUD ────────────────────────────────────────────────────────────────

  /** POST /products */
  create: (data: KolshiProductInput) =>
    HttpClient.post<Product>(API_ENDPOINTS.PRODUCTS, data),

  /** PUT /products/{id} */
  update: ({ id, ...data }: KolshiProductInput & { id: string | number }) =>
    HttpClient.put<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`, data),

  /** DELETE /products/{id} */
  delete: ({ id }: { id: string | number }) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.PRODUCTS}/${id}`),

  // ── Publish / unpublish (super_admin) ────────────────────────────────────

  /** POST /products/{id}/publish */
  publish: (id: string | number) =>
    HttpClient.post<void>(`${API_ENDPOINTS.PRODUCTS}/${id}/publish`, {}),

  /** POST /products/{id}/unpublish */
  unpublish: (id: string | number) =>
    HttpClient.post<void>(`${API_ENDPOINTS.PRODUCTS}/${id}/unpublish`, {}),

  // ── Product images ────────────────────────────────────────────────────────

  /** GET /products/{productId}/images */
  getImages: (productId: string | number) =>
    HttpClient.get<KolshiProductImage[]>(
      `${API_ENDPOINTS.PRODUCTS}/${productId}/images`,
    ),

  /** POST /products/{productId}/images */
  addImage: (productId: string | number, data: KolshiProductImageInput) =>
    HttpClient.post<KolshiProductImage>(
      `${API_ENDPOINTS.PRODUCTS}/${productId}/images`,
      data,
    ),

  /** POST /products/images/{imageId}/set-primary */
  setPrimaryImage: (imageId: number) =>
    HttpClient.post<void>(
      `${API_ENDPOINTS.PRODUCTS}/images/${imageId}/set-primary`,
      {},
    ),

  /** DELETE /products/images/{imageId} */
  deleteImage: (imageId: number) =>
    HttpClient.delete<void>(`${API_ENDPOINTS.PRODUCTS}/images/${imageId}`),

  // ── Product variations ────────────────────────────────────────────────────

  /** GET /products/{productId}/variations */
  getVariations: (productId: string | number) =>
    HttpClient.get<KolshiVariation[]>(
      `${API_ENDPOINTS.PRODUCTS}/${productId}/variations`,
    ),

  /** POST /products/{productId}/variations */
  addVariation: (
    productId: string | number,
    data: KolshiVariationInput,
  ) =>
    HttpClient.post<KolshiVariation>(
      `${API_ENDPOINTS.PRODUCTS}/${productId}/variations`,
      data,
    ),

  /** PUT /products/variations/{variationId} */
  updateVariation: (variationId: number, data: KolshiVariationInput) =>
    HttpClient.put<KolshiVariation>(
      `${API_ENDPOINTS.PRODUCTS}/variations/${variationId}`,
      data,
    ),

  /** POST /products/variations/{variationId}/toggle */
  toggleVariation: (variationId: number) =>
    HttpClient.post<void>(
      `${API_ENDPOINTS.PRODUCTS}/variations/${variationId}/toggle`,
      {},
    ),

  /** DELETE /products/variations/{variationId} */
  deleteVariation: (variationId: number) =>
    HttpClient.delete<void>(
      `${API_ENDPOINTS.PRODUCTS}/variations/${variationId}`,
    ),

  // ── Bulk CSV ──────────────────────────────────────────────────────────────

  /**
   * POST /products/import — multipart/form-data, field: `file`.
   * Backend cap: 1 000 rows. Exceeding returns 422 with per-row errors.
   */
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return HttpClient.post<ProductImportResult>(
      API_ENDPOINTS.IMPORT_PRODUCTS,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

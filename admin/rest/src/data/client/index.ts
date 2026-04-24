/**
 * Central re-export for admin data-layer shared infrastructure.
 *
 * Per-feature clients (user.ts, shop.ts, product.ts, …) import directly
 * from their dedicated client files.  This barrel lets components that need
 * only the core primitives (`HttpClient`, `API_ENDPOINTS`, pagination/error
 * utils) do so with a single import path.
 */

export { HttpClient, Axios, getFormErrors, getFieldErrors } from './http-client';
export { API_ENDPOINTS } from './api-endpoints';
export {
  toSpringPageParams,
  toPaginatorInfo,
  mapSort,
  DEFAULT_PAGE_SIZE,
  type CallerPageParams,
  type KolshiPageResponse,
  type SortMapping,
  type TemplateSort,
} from '@/utils/pagination';
export {
  normalizeApiError,
  getFormErrors as getNormalizedFormErrors,
  getFieldErrors as getNormalizedFieldErrors,
  getErrorCode,
  isApiError,
  type KolshiErrorPayload,
  type NormalizedApiError,
} from '@/utils/error-handler';
export {
  useCloudinaryUpload,
  uploadFilesToCloudinary,
  type CloudinaryUploadResult,
  type UseCloudinaryUploadOptions,
} from '@/utils/cloudinary';

import axios, { AxiosError } from 'axios';

/**
 * Kolshi's standard error payload. Shape is guaranteed by the backend's
 * `GlobalExceptionHandler`; every 4xx / 5xx response conforms to it.
 */
export interface KolshiErrorPayload {
  message: string;
  errorCode?: string;
  timestamp?: string;
  path?: string;
  errors?: Record<string, string> | null;
}

/**
 * Shape consumed by the UI layer. Always safe to read: field errors default
 * to an empty object, the rest to sensible sentinels.
 */
export interface NormalizedApiError {
  status: number;
  message: string;
  errorCode: string | null;
  fieldErrors: Record<string, string>;
  path: string | null;
  raw: AxiosError<KolshiErrorPayload>;
}

export function isApiError(err: unknown): err is AxiosError<KolshiErrorPayload> {
  return axios.isAxiosError(err);
}

/**
 * Normalizes an arbitrary thrown value into {@link NormalizedApiError}.
 * Returns `null` when the value is not an axios error — caller should fall
 * back to a generic unexpected-error toast in that case.
 */
export function normalizeApiError(err: unknown): NormalizedApiError | null {
  if (!isApiError(err)) return null;
  const data = err.response?.data;
  return {
    status: err.response?.status ?? 0,
    message: data?.message ?? err.message ?? 'Unexpected error',
    errorCode: data?.errorCode ?? null,
    fieldErrors: data?.errors ?? {},
    path: data?.path ?? null,
    raw: err,
  };
}

/**
 * Back-compat shim. The template's forms read `error.response.data.message`
 * via this helper; keeping the name means form code does not churn.
 */
export function getFormErrors(err: unknown): string | null {
  return normalizeApiError(err)?.message ?? null;
}

/**
 * Back-compat shim. Template forms read `error.response.data.errors`.
 */
export function getFieldErrors(err: unknown): Record<string, string> | null {
  const n = normalizeApiError(err);
  return n ? n.fieldErrors : null;
}

/**
 * Surfaces the machine-readable Kolshi `errorCode` (e.g. `EMAIL_NOT_VERIFIED`)
 * for conditional UI. See `API_CLIENT_SETUP.md` §6 for the known code table.
 */
export function getErrorCode(err: unknown): string | null {
  return normalizeApiError(err)?.errorCode ?? null;
}

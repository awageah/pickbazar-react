import { Routes } from '@/config/routes';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import type { SearchParamOptions } from '@/types';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';
import invariant from 'tiny-invariant';
import { resolveAcceptLanguage } from '../utils/accept-language';
import {
  toPaginatorInfo,
  toSpringPageParams,
  type CallerPageParams,
  type KolshiPageResponse,
} from '../utils/pagination';
import type { PaginatorInfo } from '@/types';

invariant(
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  'NEXT_PUBLIC_REST_API_ENDPOINT is not defined — see ENV_SETUP.md §2.',
);

export const Axios: AxiosInstance = axios.create({
  // Includes `/api/v1` per the Kolshi contract — see ENV_SETUP.md §1.
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  // Spring endpoints have a p95 SLO < 2s; 30s is generous headroom without
  // hiding server-side regressions. Template shipped 5_000_000 (≈83 min).
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    // Forces Spring's content negotiator to respond with JSON instead of
    // falling back to XML on some error paths.
    Accept: 'application/json',
  },
});

/**
 * Reads the auth token cookie. Kolshi writes the full `AuthResponse` as JSON
 * (`{ token, permissions, role, expires_in }`); legacy cookies may still be
 * raw token strings — we handle both defensively.
 */
function readToken(): string {
  const raw = Cookies.get(AUTH_TOKEN_KEY);
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    return parsed?.token ?? '';
  } catch {
    return raw;
  }
}

// Bearer interceptor. Skipping the header entirely when no token is present is
// important: Spring Security rejects `Bearer ` (empty) with 401 before any
// anonymous endpoint runs (e.g. `/products`, `/settings` during SSR).
Axios.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Accept-Language interceptor. Separate registration keeps each interceptor
// independently testable.
Axios.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['Accept-Language'] = resolveAcceptLanguage();
  return config;
});

let redirecting = false;

// 401 response handler. No refresh-token flow exists — the only recovery from
// an expired/invalid JWT is a full re-login.
//
// Shop-specific behaviour:
//   - 401: clear the cookie and bounce the user home; the login modal takes
//          over from there.
//   - 403: treated as a per-endpoint permission error, NOT a session failure
//          (don't log the user out just because they hit an endpoint they
//          aren't allowed on).
//
// React-Query cache is wiped separately by `useLogoutOnUnauthorized` mounted
// in `_app.tsx` — axios cannot reach the React tree safely.
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !redirecting) {
      redirecting = true;
      Cookies.remove(AUTH_TOKEN_KEY);
      Router.replace(Routes.home).finally(() => {
        redirecting = false;
      });
    }
    return Promise.reject(error);
  },
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await Axios.get<T>(url, { params });
    return response.data;
  }

  /**
   * GET a Kolshi-paginated endpoint and return the result in the template's
   * `PaginatorInfo<T>` shape. Caller supplies 1-indexed `page`.
   */
  static async getPaginated<T>(
    url: string,
    params?: CallerPageParams,
  ): Promise<PaginatorInfo<T>> {
    const response = await Axios.get<KolshiPageResponse<T>>(url, {
      params: toSpringPageParams(params ?? {}),
    });
    return toPaginatorInfo<T>(response.data);
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await Axios.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await Axios.delete<T>(url);
    return response.data;
  }

  /**
   * @deprecated Kolshi expects flat query params (e.g. `?categoryId=12`)
   *             instead of Laravel-Fractal composite strings. Kept as a
   *             temporary shim so S2–S5 callers continue to compile; each
   *             caller is rewritten in its respective phase, and this helper
   *             is removed wholesale in phase S6.
   */
  static formatSearchParams(params: Partial<SearchParamOptions>) {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['type', 'categories', 'tags', 'author', 'manufacturer', 'shops'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`,
      )
      .join(';');
  }
}

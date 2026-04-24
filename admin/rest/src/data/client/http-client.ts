import { Routes } from '@/config/routes';
import Cookies from 'js-cookie';
import Router from 'next/router';
import axios, { type AxiosInstance } from 'axios';
import invariant from 'tiny-invariant';
import { resolveAcceptLanguage } from '@/utils/accept-language';
import {
  toPaginatorInfo,
  toSpringPageParams,
  type CallerPageParams,
  type KolshiPageResponse,
} from '@/utils/pagination';
import type { PaginatorInfo } from '@/types';

invariant(
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  'NEXT_PUBLIC_REST_API_ENDPOINT is not defined — see ENV_SETUP.md §3.',
);

const AUTH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'AUTH_CRED';

export const Axios: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  // Spring endpoints have a p95 SLO < 2s; 30 s is generous headroom.
  // Template shipped 50 000 ms (50 s) which hides slow-server regressions.
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    // Forces Spring's content negotiator to respond with JSON, not XML.
    Accept: 'application/json',
  },
});

/**
 * Reads the Bearer token from the `AUTH_CRED` cookie.
 * Kolshi writes `{ token, permissions, role, expires_in }` as JSON; we read
 * just the `token` field. Handles both the JSON shape and plain-string
 * legacy cookies defensively.
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

// Bearer interceptor — omit the header entirely when no token is present
// so Spring Security anonymous-endpoint chains are not broken by an
// `Authorization: Bearer ` (empty-bearer) header.
Axios.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Accept-Language interceptor — reads the locale persisted by i18next in
// localStorage (`i18nextLng`); falls back to `NEXT_PUBLIC_DEFAULT_LANGUAGE`
// (default `ar`) on SSR or when localStorage is unavailable.
Axios.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['Accept-Language'] = resolveAcceptLanguage();
  return config;
});

let redirecting = false;

// 401 response handler.  No refresh-token flow exists in Kolshi — the only
// recovery from an expired/missing JWT is a full re-login via `/login`.
//
// Behaviour:
//   401 → clear AUTH_CRED cookie + redirect to `/login`.
//   403 → per-endpoint permission error, NOT a session failure; let the
//         component handle it (do NOT log the user out).
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !redirecting) {
      redirecting = true;
      Cookies.remove(AUTH_TOKEN_KEY);
      Router.replace(Routes.login).finally(() => {
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
   * GET a Kolshi-paginated endpoint and return in the template's
   * `PaginatorInfo<T>` shape.  Caller supplies 1-indexed `page`.
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
}

export function getFormErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? null;
  }
  return null;
}

export function getFieldErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.errors ?? null;
  }
  return null;
}

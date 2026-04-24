import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import type { AuthResponse } from '@/types';

/**
 * Thin wrapper around the single `auth_token` cookie. Kolshi stores the full
 * `AuthResponse` (token + permissions + role + expires_in) as JSON under this
 * one key so the HTTP client and client-side guards can pull everything they
 * need from a single source of truth.
 *
 * `emailVerified` is no longer cookie-backed — `email_verified` flows live on
 * `GET /me`, so the `useUser()` hook is the authoritative source.
 */
export function useToken() {
  return {
    /**
     * Persists the auth payload as JSON. `expires_in` (in ms from the backend)
     * is converted to fractional days for `js-cookie`; anything shorter than
     * one hour is rounded up to keep tabs usable across quick refreshes.
     */
    setToken(auth: AuthResponse | string) {
      if (typeof auth === 'string') {
        Cookies.set(AUTH_TOKEN_KEY, auth, { expires: 1, sameSite: 'lax' });
        return;
      }
      const payload = {
        token: auth.token,
        permissions: auth.permissions ?? [],
        role: auth.role ?? null,
        expires_in: auth.expires_in ?? null,
      };
      const expiresInDays =
        auth.expires_in && Number.isFinite(auth.expires_in)
          ? auth.expires_in / (1000 * 60 * 60 * 24)
          : 1;
      Cookies.set(AUTH_TOKEN_KEY, JSON.stringify(payload), {
        expires: Math.max(1 / 24, expiresInDays),
        sameSite: 'lax',
      });
    },
    getToken(): string | undefined {
      const raw = Cookies.get(AUTH_TOKEN_KEY);
      if (!raw) return undefined;
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') return parsed;
        return parsed?.token ?? undefined;
      } catch {
        return raw;
      }
    },
    removeToken() {
      Cookies.remove(AUTH_TOKEN_KEY);
    },
    hasToken(): boolean {
      const raw = Cookies.get(AUTH_TOKEN_KEY);
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') return !!parsed;
        return !!parsed?.token;
      } catch {
        return !!raw;
      }
    },
  };
}

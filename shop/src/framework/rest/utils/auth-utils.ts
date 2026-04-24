import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import type { AuthResponse } from '@/types';
import {
  AUTH_CRED,
  CUSTOMER,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

/**
 * Role sets the shop uses for guard logic. Kolshi roles are singular strings
 * (not arrays) but we still expose these grouped lists so legacy consumers
 * that filter on `permissions.includes(...)` keep working.
 */
export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF, CUSTOMER];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

/**
 * Persists the full Kolshi `AuthResponse` (`token` + `permissions` + `role` +
 * `expires_in`) as a single JSON cookie named {@link AUTH_CRED}. The HTTP
 * client reads `token` out of this cookie to mint the Bearer header, while
 * client-side guards read `permissions`/`role` to show/hide UI.
 *
 * The cookie expiry mirrors the JWT's own lifetime so the browser drops the
 * credential around the same time the backend rejects it — this avoids the
 * awkward window where we keep sending a token that is already expired.
 * Kolshi ships `expires_in` as milliseconds; we convert to fractional days.
 */
export function setAuthCredentials(auth: AuthResponse): void {
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
  Cookie.set(AUTH_CRED, JSON.stringify(payload), {
    expires: Math.max(1 / 24, expiresInDays),
    sameSite: 'lax',
  });
}

export function clearAuthCredentials(): void {
  Cookie.remove(AUTH_CRED);
}

type StoredAuth = {
  token: string | null;
  permissions: string[] | null;
  role: string | null;
  expires_in: number | null;
};

export function getAuthCredentials(context?: any): StoredAuth {
  let raw: string | undefined;
  if (context) {
    raw = parseSSRCookie(context)[AUTH_CRED];
  } else {
    raw = Cookie.get(AUTH_CRED);
  }
  if (!raw) {
    return { token: null, permissions: null, role: null, expires_in: null };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return { token: parsed, permissions: [], role: null, expires_in: null };
    }
    return {
      token: parsed?.token ?? null,
      permissions: Array.isArray(parsed?.permissions) ? parsed.permissions : [],
      role: parsed?.role ?? null,
      expires_in: parsed?.expires_in ?? null,
    };
  } catch {
    return { token: raw, permissions: [], role: null, expires_in: null };
  }
}

export function parseSSRCookie(context: any): Record<string, string> {
  return SSRCookie.parse(context?.req?.headers?.cookie ?? '');
}

export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | undefined | null,
): boolean {
  if (!_userPermissions?.length) return false;
  return _allowedRoles.some((role) => _userPermissions.includes(role));
}

export function isAuthenticated(_cookies: any): boolean {
  return (
    !!_cookies?.[TOKEN] &&
    Array.isArray(_cookies?.[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}

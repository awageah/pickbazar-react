import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import { AUTH_CRED, STAFF, STORE_OWNER, SUPER_ADMIN } from './constants';

// ─── Role sets ───────────────────────────────────────────────────────────────

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

// ─── Cookie key ──────────────────────────────────────────────────────────────

const AUTH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'AUTH_CRED';

// ─── Cookie write ────────────────────────────────────────────────────────────

/**
 * Writes the full Kolshi `AuthResponse` into the `AUTH_CRED` cookie.
 *
 * `expires_in` is in **milliseconds** (backend returns 86 400 000 = 24 h).
 * When present it drives the cookie's `expires` attribute so the browser
 * naturally evicts the credential; when absent the cookie is session-lived.
 *
 * The cookie payload `{ token, permissions, role }` matches the shape that
 * the Bearer interceptor (`http-client.ts`) and `getAuthCredentials` read.
 */
export function setAuthCredentials(
  token: string,
  permissions: string[],
  role: string,
  expires_in?: number,
): void {
  const options: Cookie.CookieAttributes = { sameSite: 'Lax' };
  if (expires_in && expires_in > 0) {
    // expires_in is milliseconds; js-cookie expects fractional days
    options.expires = expires_in / (1_000 * 60 * 60 * 24);
  }
  Cookie.set(
    AUTH_TOKEN_KEY,
    JSON.stringify({ token, permissions, role }),
    options,
  );
}

// ─── Cookie read ─────────────────────────────────────────────────────────────

export interface AuthCredentials {
  token: string | null;
  permissions: string[] | null;
  role: string | null;
}

/**
 * Reads the `AUTH_CRED` cookie.
 *
 * Works in two contexts:
 *   - Client: reads via `js-cookie`.
 *   - SSR: reads via `cookie` package from the Next.js request `context`.
 */
export function getAuthCredentials(context?: any): AuthCredentials {
  let authCred: string | undefined;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_TOKEN_KEY];
  } else {
    authCred = Cookie.get(AUTH_TOKEN_KEY);
  }
  if (authCred) {
    try {
      return JSON.parse(authCred) as AuthCredentials;
    } catch {
      // Corrupt cookie — treat as unauthenticated.
    }
  }
  return { token: null, permissions: null, role: null };
}

export function parseSSRCookie(context: any): Record<string, string> {
  return SSRCookie.parse(context.req?.headers?.cookie ?? '');
}

// ─── Access helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when `_userPermissions` contains at least one of
 * `_allowedRoles`.
 */
export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | undefined | null,
): boolean {
  if (!_userPermissions?.length) return false;
  return _allowedRoles.some((role) => _userPermissions.includes(role));
}

/**
 * Returns true when both a token and at least one permission are present.
 * Mirrors the shape `{ token, permissions }` returned by
 * `getAuthCredentials`.
 */
export function isAuthenticated(_cookies: {
  token: string | null;
  permissions: string[] | null;
}): boolean {
  return (
    !!_cookies.token &&
    Array.isArray(_cookies.permissions) &&
    _cookies.permissions.length > 0
  );
}

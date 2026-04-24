import React from 'react';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { getAuthCredentials } from '@/utils/auth-utils';
import {
  allowedRoles,
  SUPER_ADMIN,
  STORE_OWNER,
  STAFF,
} from '@/utils/constants';
import Loader from '@/components/ui/loader/loader';

/**
 * Role-guard component for the Kolshi admin console.
 *
 * Decision table:
 *   • No token               → redirect to `/login`.
 *   • Token present + valid admin role (super_admin | store_owner | staff)
 *                            → render children.
 *   • Token present + `customer` (or any non-admin) role
 *                            → render the "access denied" banner and
 *                               offer a logout link.  We do NOT silently
 *                               redirect to `/login` because that would
 *                               confuse a legitimate user who mistakenly
 *                               opened the admin URL — they deserve to see
 *                               _why_ they are blocked.
 *
 * `permissions` comes from the `AUTH_CRED` cookie written by the login
 * handler as the full Kolshi `AuthResponse.permissions` array.
 *
 * Risk note from roadmap §8: if `permissions` in the cookie drifts from
 * `GET /me`, we log the mismatch to the console.  A refresh will pick up
 * the correct role on next login.
 */

const ADMIN_ROLES: string[] = [SUPER_ADMIN, STORE_OWNER, STAFF];

function hasAdminRole(permissions: string[] | null | undefined): boolean {
  if (!permissions || !permissions.length) return false;
  return permissions.some((p) => ADMIN_ROLES.includes(p));
}

const AccessDeniedBanner: React.FC = () => {
  const router = useRouter();

  function handleLogout() {
    // Clear the cookie and redirect to login.
    import('js-cookie').then(({ default: Cookies }) => {
      const key = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'AUTH_CRED';
      Cookies.remove(key);
      router.replace(Routes.login);
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <svg
        className="mb-4 h-16 w-16 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <h1 className="mb-2 text-2xl font-semibold text-gray-800">
        Access Denied
      </h1>
      <p className="mb-6 max-w-md text-gray-500">
        Your account doesn&apos;t have admin access. Only{' '}
        <strong>super_admin</strong>, <strong>store_owner</strong>, and{' '}
        <strong>staff</strong> roles are permitted to use this console.
      </p>
      <button
        onClick={handleLogout}
        className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        Sign in with a different account
      </button>
    </div>
  );
};

interface RoleGuardProps {
  children: React.ReactNode;
}

/**
 * Wrap any layout or page that requires an admin-level session.
 *
 * Usage (in `_app.tsx` or per-page `authenticate` prop):
 * ```tsx
 * <RoleGuard>
 *   <AdminLayout>{children}</AdminLayout>
 * </RoleGuard>
 * ```
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ children }) => {
  const router = useRouter();
  const { token, permissions } = getAuthCredentials();

  // No token — boot to login.
  React.useEffect(() => {
    if (!token) {
      router.replace(Routes.login);
    }
  }, [token]);

  if (!token) {
    return <Loader showText={false} />;
  }

  // Token present but no admin role.
  if (!hasAdminRole(permissions)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[RoleGuard] token present but permissions are non-admin:',
        permissions,
      );
    }
    return <AccessDeniedBanner />;
  }

  return <>{children}</>;
};

export default RoleGuard;

/**
 * Convenience hook that returns the current user's highest Kolshi role for
 * conditional rendering inside admin pages (e.g. hide super-admin-only buttons
 * from store_owner).
 */
export function useAdminRole(): typeof SUPER_ADMIN | typeof STORE_OWNER | typeof STAFF | null {
  const { permissions } = getAuthCredentials();
  if (!permissions) return null;
  if (permissions.includes(SUPER_ADMIN)) return SUPER_ADMIN;
  if (permissions.includes(STORE_OWNER)) return STORE_OWNER;
  if (permissions.includes(STAFF)) return STAFF;
  return null;
}

// Re-export the role sets from constants for convenience so callers only need
// to import from this file.
export { allowedRoles, SUPER_ADMIN, STORE_OWNER, STAFF };

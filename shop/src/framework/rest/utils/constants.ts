/**
 * Kolshi uses the upper-case discriminator on the wire (`SHIPPING`/`BILLING`).
 * The legacy enum values (`billing`/`shipping`) are retained as aliases so
 * template radio buttons continue to render until every consumer migrates to
 * {@link KolshiAddressType} from `@/types`.
 */
export enum AddressType {
  Billing = 'BILLING',
  Shipping = 'SHIPPING',
}

export const SUPER_ADMIN = 'super_admin';
export const STORE_OWNER = 'store_owner';
export const STAFF = 'staff';
export const CUSTOMER = 'customer';
export const TOKEN = 'token';
export const PERMISSIONS = 'permissions';
/**
 * Single source of truth for the auth cookie name.
 * Aligns with the shared `AUTH_TOKEN_KEY` in `@/lib/constants` (default
 * `auth_token`, overridable via `NEXT_PUBLIC_AUTH_TOKEN_KEY`).
 */
export const AUTH_CRED =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'auth_token';
export const MAINTENANCE_DETAILS = 'MAINTENANCE_DETAILS';

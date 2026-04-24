import { User } from '@/types';
import { atom } from 'jotai';

export const CART_KEY = 'pick-cart';
export const TOKEN = 'token';
/**
 * Cookie name for the auth payload. Overridable via env so deployments can
 * shard cookies per environment (e.g. dev vs staging on the same domain).
 */
export const AUTH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'auth_token';
export const AUTH_PERMISSIONS = 'auth_permissions';
export const LIMIT = 10;
export const LIMIT_HUNDRED = 100;
export const SUPER_ADMIN = 'super_admin';
export const CUSTOMER = 'customer';
export const CHECKOUT = 'pickbazar-checkout';
export const SHOPS_LIMIT = 20;
export const RTL_LANGUAGES: ReadonlyArray<string> = ['ar', 'he'];
export const PRODUCT_INITIAL_FETCH_LIMIT = 30;
// Kolshi is Arabic-first; fallback was `'en'` in the Pickbazar template.
export const DEFAULT_LANGUAGE =
  process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? 'ar';
export const RESPONSIVE_WIDTH = 1024 as number;

export function getDirection(language: string | undefined) {
  if (!language) return 'ltr';
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}

export const checkIsMaintenanceModeComing = atom(false);
export const checkIsMaintenanceModeStart = atom(false);
export const checkIsShopMaintenanceModeComing = atom(false);
export const checkIsShopMaintenanceModeStart = atom(false);
export const checkIsScrollingStart = atom(false);
export const setNewAddress = atom<any>([]);

export const isMultiLangEnable =
  process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
  !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

export const NEWSLETTER_POPUP_MODAL_KEY = 'SEEN_POPUP';
export const REVIEW_POPUP_MODAL_KEY = 'SEEN_REVIEW_POPUP';

/**
 * Kolshi route catalogue.
 *
 * Only routes backed by a real page and at least one live caller remain
 * in this file. The S6 cleanup removed the long trail of "dead" stubs
 * ('#') for authors / manufacturers / flash-sales / refunds / downloads
 * / newsletter / become-seller etc. — their pages and consumer links
 * are deleted, so the stubs were no longer load-bearing.
 *
 * Two exceptions are kept as `'#'` on purpose:
 *   - `author(slug)` and `manufacturer(slug)` remain because the Book /
 *     Radon product cards still try to link the `product.author` /
 *     `product.manufacturer` when they are present. Kolshi never
 *     populates those fields, so the guarded branches don't render,
 *     but the functions must still exist for TypeScript.
 */
export const Routes = {
  home: '/',
  checkout: '/checkout',
  profile: '/profile',
  verifyEmail: '/verify-email',
  changePassword: '/change-password',
  orders: '/orders',
  order: (tracking_number: string) =>
    `/orders/${encodeURIComponent(tracking_number)}`,
  /**
   * Kolshi F.3.5 — multi-shop order confirmation. Accepts a comma-separated
   * list of tracking numbers as the `ids` query param.
   */
  orderReceived: '/orders/order-received',
  /**
   * Kolshi H.2 — public tracking page.
   * Route renamed from `/track-order` → `/tracking` to match the Kolshi
   * handoff spec and backend-generated tracking links (email / SMS).
   * All internal callers use this constant so no other files need updating.
   */
  trackOrder: '/tracking',
  logout: '/logout',
  products: '/products',
  product: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  privacy: '/privacy',
  terms: '/terms',
  contactUs: '/contact',
  shops: '/shops',
  shop: (slug: string) => `/shops/${encodeURIComponent(slug)}`,
  search: '/search',
  wishlists: '/wishlists',
  notifyLogs: '/notification',
  notifyLogsSingle: (id: string) => `/notification/${encodeURIComponent(id)}`,

  /* ─── Legacy / Kolshi-unsupported (keep for compile, never rendered) ── */
  author: (_slug: string) => '#',
  manufacturer: (_slug: string) => '#',
};

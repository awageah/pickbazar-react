/**
 * Kolshi API endpoint catalogue.
 *
 * - Keys are STABLE across phases — consumers (data-layer modules, hooks,
 *   components) keep importing the same names while the values point at
 *   the Kolshi backend instead of the legacy Pickbazar routes.
 * - Paths are relative to `NEXT_PUBLIC_REST_API_ENDPOINT` (which already
 *   ends in `/api/v1`). Do NOT add `/api/v1` prefixes here.
 * - Keys removed in S6 (authors, manufacturers, flash-sales, refunds,
 *   store-notices, FAQs, terms, become-seller, newsletter, abuse-reports,
 *   product Q&A, saved cards, payment intents, guest checkout, multipart
 *   uploads, social/OTP auth) are gone — their backend endpoints do not
 *   exist on Kolshi and the shop has no consumer left. Re-add an entry
 *   only when the backend route AND a UI surface come back together.
 *
 * Source of truth: `kolshi-backend/docs/handoff/KOLSHI_FRONTEND_HANDOFF.md`.
 */
export const API_ENDPOINTS = {
  // ── Catalog ─────────────────────────────────────────────────
  PRODUCTS: '/products',
  PRODUCTS_POPULAR: '/products/popular',
  PRODUCTS_BEST_SELLING: '/products/best-selling',
  PRODUCTS_NEW_ARRIVALS: '/products/new-arrivals',
  PRODUCTS_RELATED: '/products', // suffix: `/${id}/related`
  PRODUCTS_FBT: '/products', // suffix: `/${id}/frequently-bought-together`
  PRODUCTS_RECENTLY_VIEWED: '/products/recently-viewed',
  PRODUCTS_IMAGES: '/products', // suffix: `/${id}/images`
  PRODUCTS_VARIATIONS: '/products', // suffix: `/${id}/variations`

  CATEGORIES: '/categories',
  CATEGORIES_TREE: '/categories/tree',
  CATEGORIES_ROOTS: '/categories/roots',

  /**
   * Kept as a React-Query cache-key only. The `/types` route was removed
   * from Kolshi (decision log E.5); `client.types.*` resolves a synthetic
   * default type without touching the network. SSR prefetches still key
   * their cache off this value so the client-side hydrate is a hit.
   */
  TYPES: '/types',

  // ── Reviews (Kolshi /reviews/*) ─────────────────────────────
  // Base. `POST /reviews` creates a review; `GET /reviews/{id}` reads one;
  // `DELETE /reviews/{id}` deletes one.
  PRODUCTS_REVIEWS: '/reviews',
  // Paginated list scoped to one product — note **singular** `product` segment.
  PRODUCT_REVIEWS_BY_PRODUCT: '/reviews/product', // suffix: `/${productId}`
  // Summary + rating endpoints use **plural** `products`.
  PRODUCT_REVIEWS_SUMMARY: '/reviews/products', // suffix: `/${productId}/summary`
  PRODUCT_REVIEWS_RATING: '/reviews/products', // suffix: `/${productId}/rating`
  // Shop-owner response is nested under the review. Read-only on the shop.
  REVIEW_RESPONSE: '/reviews', // suffix: `/${reviewId}/response`
  // Helpful / not-helpful votes.
  REVIEW_VOTE: '/reviews', // suffix: `/${reviewId}/vote`

  // ── Shops ───────────────────────────────────────────────────
  SHOPS: '/shops',

  // ── Auth ────────────────────────────────────────────────────
  USERS_REGISTER: '/auth/register',
  USERS_LOGIN: '/auth/login',
  USERS_FORGOT_PASSWORD: '/auth/forgot-password',
  USERS_VERIFY_FORGOT_PASSWORD_TOKEN: '/auth/validate-reset-token',
  USERS_RESET_PASSWORD: '/auth/reset-password',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  SEND_VERIFICATION_EMAIL: '/auth/resend-verification',

  // ── Profile / account (current user) ────────────────────────
  USERS_ME: '/me',
  ME_PROFILE: '/me/profile',
  ME_ADDRESSES: '/me/addresses', // suffix optional: `/${id}`, `/${id}/default`

  // ── Wishlist (Kolshi /wishlist/*) ───────────────────────────
  // All wishlist endpoints are **singular** on the backend.
  //   GET    /wishlist                        → paginated list
  //   DELETE /wishlist                        → clear entire wishlist
  //   GET    /wishlist/count                  → `{ count }`
  //   POST   /wishlist/products/{productId}   → add
  //   DELETE /wishlist/products/{productId}   → remove
  //   GET    /wishlist/products/{productId}/check → `{ inWishlist }`
  WISHLIST: '/wishlist',
  WISHLIST_PRODUCTS: '/wishlist/products', // suffix: `/${productId}` or `/${productId}/check`
  WISHLIST_COUNT: '/wishlist/count',

  // ── Cart ────────────────────────────────────────────────────
  CART: '/cart',
  CART_ITEMS: '/cart/items',

  // ── Orders / tracking ───────────────────────────────────────
  ORDERS: '/orders',
  ORDERS_HISTORY: '/orders', // suffix: `/${id}/history`
  TRACKING: '/tracking',

  // ── Coupons — Kolshi F.5 / K.1 ──────────────────────────────
  // The bare `GET /coupons` listing and the admin-scoped
  // `GET /coupons/{id}/usages` endpoint are intentionally omitted:
  // they are `super_admin` only on Kolshi, and the public "/offers"
  // page has been retired (see decision log K.1). The shop reaches
  // coupons only via the checkout validate / best-match flow.
  COUPONS_VALIDATE: '/coupons/validate',
  COUPONS_BEST_MATCH: '/coupons/best-match',

  // ── Notifications / settings ────────────────────────────────
  // Kolshi only exposes list / get-one / count. There is NO
  // mark-as-read endpoint on the server; the shop tracks read-state
  // client-side (localStorage per user) — see `framework/rest/notify-logs.ts`.
  NOTIFY_LOGS: '/notifications',
  NOTIFICATIONS_COUNT: '/notifications/count',

  SETTINGS: '/settings',
};

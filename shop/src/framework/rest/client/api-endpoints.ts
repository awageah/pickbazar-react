/**
 * Kolshi API endpoint catalogue.
 *
 * - Keys are STABLE across phases — consumers (data-layer modules, hooks,
 *   components) keep importing the same names while their values point at
 *   the Kolshi backend instead of the legacy Pickbazar routes.
 * - Keys whose feature is slated for **Delete** in the decision log still
 *   resolve to their legacy paths until the consumer itself is removed in
 *   S6 / A9 — this keeps the codebase compiling through S1–S5.
 * - Paths are relative to `NEXT_PUBLIC_REST_API_ENDPOINT` (which already
 *   ends in `/api/v1`). Do NOT add `/api/v1` prefixes here.
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
  PRODUCTS_IMPORT: '/products/import',
  PRODUCTS_EXPORT: '/products/export',
  PRODUCTS_IMPORT_TEMPLATE: '/products/import-template',

  CATEGORIES: '/categories',
  CATEGORIES_TREE: '/categories/tree',
  CATEGORIES_ROOTS: '/categories/roots',

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
  SHOPS_PENDING: '/shops/pending',
  SHOPS_MY: '/shops/my-shops',
  SHOPS_STAFF: '/shops', // suffix: `/${shopId}/staff`
  SHOPS_SETTINGS: '/shops', // suffix: `/${id}/settings`
  SHOPS_BALANCE: '/shops', // suffix: `/${id}/balance`
  SHOPS_TRANSACTIONS: '/shops', // suffix: `/${id}/transactions`

  // ── Auth ────────────────────────────────────────────────────
  USERS_REGISTER: '/auth/register',
  USERS_LOGIN: '/auth/login',
  USERS_FORGOT_PASSWORD: '/auth/forgot-password',
  USERS_VERIFY_FORGOT_PASSWORD_TOKEN: '/auth/validate-reset-token',
  USERS_RESET_PASSWORD: '/auth/reset-password',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  SEND_VERIFICATION_EMAIL: '/auth/resend-verification',
  // Kolshi has no server-side logout — the client just drops the cookie.
  USERS_LOGOUT: '/auth/logout',

  // ── Profile / account (current user) ────────────────────────
  USERS_ME: '/me',
  ME_PROFILE: '/me/profile',
  ME_PASSWORD: '/me/password',
  ME_ADDRESSES: '/me/addresses', // suffix optional: `/${id}`, `/${id}/default`

  // ── Users (admin) ───────────────────────────────────────────
  USERS: '/users',
  USERS_ADDRESS: '/me/addresses', // legacy alias — replaced by ME_ADDRESSES (S2)
  USERS_CHANGE_PASSWORD: '/me/password',
  USERS_UPDATE_EMAIL: '/me/profile', // Kolshi has no dedicated email-change endpoint — legacy key kept for compilation only.

  // ── Wishlist (Kolshi /wishlist/*) ───────────────────────────
  // All wishlist endpoints are **singular** on the backend.
  //   GET    /wishlist                        → paginated list
  //   DELETE /wishlist                        → clear entire wishlist
  //   GET    /wishlist/count                  → `{ count }`
  //   POST   /wishlist/products/{productId}   → add
  //   DELETE /wishlist/products/{productId}   → remove
  //   GET    /wishlist/products/{productId}/check → `{ inWishlist }`
  WISHLIST: '/wishlist',
  USERS_WISHLIST: '/wishlist',
  WISHLIST_PRODUCTS: '/wishlist/products', // suffix: `/${productId}` or `/${productId}/check`
  WISHLIST_COUNT: '/wishlist/count',
  // Legacy toggle key — retained as compiling shim until every call site
  // migrates to the add/remove pair. Points at a route that does not exist
  // on the backend; the shim in `client.wishlist.toggle` derives the
  // correct call-site semantics from `isInWishlist` first.
  USERS_WISHLIST_TOGGLE: '/wishlist/toggle',
  WISHLIST_CHECK: '/wishlist/products', // suffix: `/${productId}/check`

  // ── Cart ────────────────────────────────────────────────────
  CART: '/cart',
  CART_ITEMS: '/cart/items',

  // ── Orders / tracking / payments ────────────────────────────
  ORDERS: '/orders',
  ORDERS_HISTORY: '/orders', // suffix: `/${id}/history`
  ORDERS_NOTES: '/orders', // suffix: `/${orderId}/notes`
  ORDERS_STATUS: '/orders', // suffix: `/${id}/status`
  ORDERS_PROCESSING: '/orders', // suffix: `/${id}/processing`
  ORDERS_AT_LOCAL_FACILITY: '/orders', // suffix: `/${id}/at-local-facility`
  ORDERS_OUT_FOR_DELIVERY: '/orders', // suffix: `/${id}/out-for-delivery`
  ORDERS_COMPLETED: '/orders', // suffix: `/${id}/completed`
  ORDERS_CANCEL: '/orders', // suffix: `/${id}/cancel`
  TRACKING: '/tracking',
  PAYMENTS_ORDER: '/payments/order',
  PAYMENTS_REFUND: '/payments', // suffix: `/${paymentId}/refund`

  // ── Coupons — Kolshi F.5 / K.1 ──────────────────────────────
  // The bare `GET /coupons` listing and the admin-scoped
  // `GET /coupons/{id}/usages` endpoint are intentionally omitted:
  // they are `super_admin` only on Kolshi, and the public "/offers"
  // page has been retired (see decision log K.1). The shop reaches
  // coupons only via the checkout validate / best-match flow.
  COUPONS_VALIDATE: '/coupons/validate',
  COUPONS_BEST_MATCH: '/coupons/best-match',

  // ── Withdrawals ─────────────────────────────────────────────
  WITHDRAWALS: '/withdrawals',
  WITHDRAWALS_PENDING: '/admin/withdrawals/pending',

  // ── Notifications / settings / system ───────────────────────
  // Kolshi only exposes list / get-one / count. There is NO mark-as-read
  // endpoint; the shop tracks read-state client-side (localStorage per
  // user). The legacy READ_* keys are kept as namespaced markers so
  // helpers in `framework/rest/notify-logs.ts` stay grep-able, but they
  // never hit the wire.
  NOTIFY_LOGS: '/notifications',
  NOTIFICATIONS_COUNT: '/notifications/count',
  READ_NOTIFY_LOG: '__client_only__/notifications/read',
  READ_ALL_NOTIFY_LOG: '__client_only__/notifications/read-all',
  NOTIFICATIONS_FAILED: '/notifications/failed',
  NOTIFICATIONS_DEAD_LETTER: '/notifications/dead-letter',
  NOTIFICATIONS_STATS: '/notifications/stats',
  NOTIFICATIONS_RETRY: '/notifications', // suffix: `/${id}/retry`

  SETTINGS: '/settings',
  SETTINGS_CACHE_REFRESH: '/settings/cache-refresh',
  SETTINGS_STATS: '/settings/stats',
  SYSTEM_STATUS: '/system/status',

  ANALYTICS_SHOPS: '/analytics/shops', // suffix: `/${id}`

  // ── Uploads ─────────────────────────────────────────────────
  // Kolshi backend stores URLs only — it does NOT accept multipart uploads.
  // Client-side uploads now go through `useCloudinaryUpload`; this key
  // exists only so legacy callers keep compiling until they are rewired.
  UPLOADS: '/attachments',

  // ───────────────────────────────────────────────────────────
  // LEGACY — features scheduled for Delete in S6 / A9 per the decision log.
  // The keys stay here so consumers still compile; the consumers themselves
  // are removed in the cleanup phases.
  // ───────────────────────────────────────────────────────────
  PRODUCTS_REVIEWS_ABUSE_REPORT: '/abusive_reports', // Delete — I.4
  PRODUCTS_QUESTIONS: '/questions', // Delete — I.2
  FEEDBACK: '/feedbacks', // Delete (Not supported by Kolshi)
  TYPES: '/types', // Delete — E.3
  TAGS: '/tags', // Delete — E.4
  AUTHORS: '/authors', // Delete — C.1
  AUTHORS_TOP: '/top-authors',
  MANUFACTURERS: '/manufacturers', // Delete — C.1
  MANUFACTURERS_TOP: '/top-manufacturers',
  ORDERS_REFUNDS: '/refunds', // Delete (customer refund UI) — F.7
  ORDERS_PAYMENT: '/orders/payment', // Stripe/PayPal/etc. — H.2 Delete
  ORDERS_CHECKOUT_VERIFY: '/orders/checkout/verify', // Delete — F.6
  ORDERS_DOWNLOADS: '/downloads', // Delete — D.8
  GENERATE_DOWNLOADABLE_PRODUCT_LINK: '/downloads/digital_file', // Delete — D.9
  USERS_SUBSCRIBE_TO_NEWSLETTER: '/subscribe-to-newsletter', // Delete — N.3
  USERS_CONTACT_US: '/contact-us', // Delete — L.5
  SOCIAL_LOGIN: '/social-login-token', // Coming Soon — A.3
  SEND_OTP_CODE: '/send-otp-code', // Coming Soon — A.4
  VERIFY_OTP_CODE: '/verify-otp-code', // Coming Soon — A.4
  OTP_LOGIN: '/otp-login', // Coming Soon — A.4
  UPDATE_CONTACT: '/update-contact', // Delete
  MY_QUESTIONS: '/my-questions', // Delete — I.2
  MY_REPORTS: '/my-reports', // Delete — I.4
  CARDS: '/cards', // Delete — H.3
  SET_DEFAULT_CARD: '/set-default-card',
  SAVE_PAYMENT_METHOD: '/save-payment-method',
  PAYMENT_INTENT: '/payment-intent',
  BEST_SELLING_PRODUCTS: '/products/best-selling', // legacy alias → PRODUCTS_BEST_SELLING
  STORE_NOTICES: 'store-notices', // Delete — M.1
  STORE_NOTICES_IS_READ: 'store-notices/read',
  FAQS: '/faqs', // Delete — L.2
  NEAR_SHOPS: '/near-by-shop', // Delete (no backend support)
  REFUNDS_REASONS: 'refund-reasons', // Delete — F.7
  TERMS_AND_CONDITIONS: 'terms-and-conditions', // Delete — L.3
  FLASH_SALE: 'flash-sale', // Delete — D.14
  PRODUCT_FLASH_SALE_INFO: 'product-flash-sale-info',
  REFUND_POLICIES: 'refund-policies', // Delete — F.7
  PRODUCTS_BY_FLASH_SALE: 'products-by-flash-sale',
  BECAME_SELLER: 'became-seller', // Delete — L.4
  SHOP_MAINTENANCE_EVENT: 'shop-maintenance-event', // Delete
};

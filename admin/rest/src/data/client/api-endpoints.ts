/**
 * Kolshi admin API endpoint keys.
 *
 * Rule: key names MUST remain stable so hook call sites do not churn when
 * values change between phases. Only the string VALUES change here; keys
 * are referenced by the data hooks (user.ts, shop.ts, product.ts, …).
 *
 * Paths are relative to NEXT_PUBLIC_REST_API_ENDPOINT (which already
 * includes `/api/v1`).  Do NOT add a leading `/api/v1` prefix.
 *
 * Keys whose features are scheduled for deletion in A9 are kept pointing
 * at their legacy paths so existing callers keep compiling.  They are
 * removed in A9 together with their consumers.
 */
export const API_ENDPOINTS = {
  // ── Auth ────────────────────────────────────────────────────────────────
  /** POST { email, password } → AuthResponse */
  TOKEN: 'auth/login',
  /** POST { name, email, password } — admin registration is disabled (A.10) */
  REGISTER: 'auth/register',
  /** GET → User (current session) */
  ME: 'me',
  /** POST { email } */
  FORGET_PASSWORD: 'auth/forgot-password',
  /** POST { token } → boolean */
  VERIFY_FORGET_PASSWORD_TOKEN: 'auth/verify-reset-token',
  /** POST { token, newPassword } */
  RESET_PASSWORD: 'auth/reset-password',
  /** POST { token } — deep-link from verification email */
  SEND_VERIFICATION_EMAIL: 'auth/resend-verification',
  /** POST — no body; triggers resend */
  LOGOUT: '__client_only__/logout',

  // ── Me / profile ─────────────────────────────────────────────────────────
  /** PUT { avatar?, bio?, contact? } */
  PROFILE_UPDATE: 'me/profile',
  /** POST { currentPassword, newPassword } */
  CHANGE_PASSWORD: 'me/password',

  // ── Users ────────────────────────────────────────────────────────────────
  /** GET (paginated) | POST (not available — A3 deletes create-user page) */
  USERS: 'users',
  /** POST /users/{id}/block */
  BLOCK_USER: 'users/{id}/block',
  /** POST /users/{id}/unblock */
  UNBLOCK_USER: 'users/{id}/unblock',
  /** POST /users/{id}/role { role } — replaces make-admin */
  MAKE_ADMIN: 'users/{id}/role',

  // ── Shops ────────────────────────────────────────────────────────────────
  /** GET (paginated) | POST */
  SHOPS: 'shops',
  /** GET — pending approval queue */
  NEW_OR_INACTIVE_SHOPS: 'shops/pending',
  /** GET — scoped to authenticated store_owner */
  MY_SHOPS: 'shops/my-shops',
  /** POST /shops/{id}/approve | POST /shops/{id}/disapprove */
  APPROVE_SHOP: 'shops/{id}/approve',
  DISAPPROVE_SHOP: 'shops/{id}/disapprove',

  // ── Shop staff ───────────────────────────────────────────────────────────
  /** POST /shops/{shopId}/staff | GET /shops/{shopId}/staff */
  STAFFS: 'shops/{shopId}/staff',
  ADD_STAFF: 'shops/{shopId}/staff',
  REMOVE_STAFF: 'shops/{shopId}/staff/{id}',
  MY_STAFFS: 'shops/my-staffs',
  ALL_STAFFS: 'shops/all-staffs',

  // ── Products ─────────────────────────────────────────────────────────────
  /** GET (paginated) | POST | PUT /{id} | DELETE /{id} */
  PRODUCTS: 'products',
  /** GET ?sortBy=popular */
  POPULAR_PRODUCTS: 'products?sortBy=popular',
  /** GET /products/draft — draft / inactive products */
  NEW_OR_INACTIVE_PRODUCTS: 'products/draft',
  /** GET /products?inStock=false */
  LOW_OR_OUT_OF_STOCK_PRODUCTS: 'products',
  /** POST /products/import (multipart) */
  IMPORT_PRODUCTS: 'products/import',
  /** GET /products/export */
  ORDER_EXPORT: 'products/export',

  // ── Product images & variations ──────────────────────────────────────────
  /** GET | POST /products/{id}/images */
  PRODUCT_IMAGES: 'products/{id}/images',
  /** GET | POST /products/{id}/variations */
  PRODUCT_VARIATIONS: 'products/{id}/variations',

  // ── Categories ───────────────────────────────────────────────────────────
  /** GET (paginated) | POST | PUT /{id} | DELETE /{id} */
  CATEGORIES: 'categories',
  /** GET /categories/tree */
  CATEGORIES_TREE: 'categories/tree',
  /** GET /categories/roots */
  CATEGORIES_ROOTS: 'categories/roots',

  // ── Orders ───────────────────────────────────────────────────────────────
  /** GET (paginated, admin sees all; store_owner scoped server-side) | POST */
  ORDERS: 'orders',
  /** GET /orders/{id}/history */
  ORDER_STATUS: 'orders/{id}/history',
  /** GET /orders/{id}/notes | POST /orders/{orderId}/notes */
  ORDER_NOTES: 'orders/{orderId}/notes',
  /** PUT /orders/{id}/cancel */
  ORDER_SEEN: 'orders/{id}/cancel',
  /** GET /payments/order/{orderId} */
  DOWNLOAD_INVOICE: 'payments/order/{orderId}',
  /** POST /payments/{paymentId}/refund */
  REFUNDS: 'payments/{paymentId}/refund',

  // ── Coupons ──────────────────────────────────────────────────────────────
  /** GET (paginated) | POST | PUT /{id} | DELETE /{id} */
  COUPONS: 'coupons',
  /** GET /coupons/{id}/usages — admin usage history */
  COUPON_USAGES: 'coupons/{id}/usages',
  /** POST /coupons/validate */
  APPROVE_COUPON: 'coupons/validate',
  /** @deprecated alias kept for compile compat */
  VERIFY_COUPONS: 'coupons/{id}/usages',
  /** @deprecated alias kept for compile compat */
  DISAPPROVE_COUPON: 'coupons/validate',

  // ── Withdrawals ──────────────────────────────────────────────────────────
  /** GET (paginated, store_owner sees own; admin sees all) | POST */
  WITHDRAWS: 'withdrawals',
  /** PUT /admin/withdrawals/{id}/approve */
  APPROVE_WITHDRAW: 'admin/withdrawals/{id}/approve',
  /** PUT /admin/withdrawals/{id}/reject */
  REJECT_WITHDRAW: 'admin/withdrawals/{id}/reject',
  /** GET /admin/withdrawals/pending — paginated admin queue */
  ADMIN_WITHDRAWALS_PENDING: 'admin/withdrawals/pending',

  // ── Reviews ──────────────────────────────────────────────────────────────
  /** GET /reviews/product/{productId} | DELETE /reviews/{id} */
  REVIEWS: 'reviews',
  /** POST /reviews/{reviewId}/response | GET | DELETE /reviews/responses/{responseId} */
  REVIEW_RESPONSE: 'reviews/{reviewId}/response',

  // ── Settings ─────────────────────────────────────────────────────────────
  /** GET /settings (public paginated list) | POST /settings | PUT /settings/{key} | DELETE /settings/{key} */
  SETTINGS: 'settings',
  /** GET /settings/category/{category} */
  SETTINGS_BY_CATEGORY: 'settings/category/{category}',
  /** POST /settings/cache/refresh */
  SETTINGS_CACHE_REFRESH: 'settings/cache/refresh',
  /** GET /settings/cache/stats */
  SETTINGS_CACHE_STATS: 'settings/cache/stats',

  // ── System ───────────────────────────────────────────────────────────────
  /** GET /system/status */
  SYSTEM_STATUS: 'system/status',

  // ── Analytics ────────────────────────────────────────────────────────────
  /** GET /analytics/shops/{shopId}?days=30 */
  SHOP_ANALYTICS: 'analytics/shops/{shopId}',

  // ── Notifications (admin view — J14–J17) ──────────────────────────────────
  /** GET /notifications — paginated user notifications (J18) */
  NOTIFY_LOGS: 'notifications',
  /** GET /admin/notifications/failed — paginated failed notifications */
  ADMIN_NOTIFICATIONS_FAILED: 'admin/notifications/failed',
  /** GET /admin/notifications/dead-letter — dead-letter queue */
  ADMIN_NOTIFICATIONS_DEAD_LETTER: 'admin/notifications/dead-letter',
  /** GET /admin/notifications/stats */
  ADMIN_NOTIFICATIONS_STATS: 'admin/notifications/stats',
  /** POST /admin/notifications/{id}/retry */
  ADMIN_NOTIFICATIONS_RETRY: 'admin/notifications/{id}/retry',

  // ── Legacy keys — kept for compile compat until A9 ────────────────────────
  /** @deprecated use SETTINGS_CACHE_REFRESH */
  ANALYTICS: 'settings/cache/refresh',
  /** @deprecated use SYSTEM_STATUS */
  LOW_STOCK_PRODUCTS_ANALYTICS: 'system/status',
  /** @deprecated use ADMIN_NOTIFICATIONS_FAILED */
  NOTIFY_LOG_SEEN: 'admin/notifications/failed',
  /** @deprecated use ADMIN_NOTIFICATIONS_DEAD_LETTER */
  READ_ALL_NOTIFY_LOG: 'admin/notifications/dead-letter',
  /** @deprecated use SHOP_ANALYTICS */
  CATEGORY_WISE_PRODUCTS: 'analytics/shops/{id}',
  CATEGORY_WISE_PRODUCTS_SALE: 'analytics/shops/{id}',

  // ── Attachments (replaced by Cloudinary) ─────────────────────────────────
  // Legacy key kept so any remaining `API_ENDPOINTS.ATTACHMENTS` reference
  // compiles.  It will be removed in A9 once all uploaders are migrated.
  ATTACHMENTS: '__cloudinary__/upload',

  // ── Deleted features — keys preserved for compile compat until A9 ─────────
  /** @deprecated A9 — no attributes in Kolshi */
  ATTRIBUTES: '__deleted__/attributes',
  ATTRIBUTE_VALUES: '__deleted__/attribute-values',
  IMPORT_ATTRIBUTES: '__deleted__/import-attributes',
  IMPORT_VARIATION_OPTIONS: '__deleted__/import-variation-options',
  /** @deprecated A9 — no tags in Kolshi */
  TAGS: '__deleted__/tags',
  /** @deprecated A9 — no types/groups in Kolshi */
  TYPES: '__deleted__/types',
  /** @deprecated A9 — no taxes in Kolshi */
  TAXES: '__deleted__/taxes',
  /** @deprecated A9 — no shippings in Kolshi */
  SHIPPINGS: '__deleted__/shippings',
  /** @deprecated A9 — no authors in Kolshi */
  AUTHORS: '__deleted__/authors',
  /** @deprecated A9 — no manufacturers in Kolshi */
  MANUFACTURERS: '__deleted__/manufacturers',
  /** @deprecated A9 — no flash-sale in Kolshi */
  FLASH_SALE: '__deleted__/flash-sale',
  PRODUCT_FLASH_SALE_INFO: '__deleted__/product-flash-sale-info',
  PRODUCTS_BY_FLASH_SALE: '__deleted__/products-by-flash-sale',
  REQUEST_LISTS_FOR_FLASH_SALE: '__deleted__/vendor-requests-for-flash-sale',
  REQUESTED_PRODUCTS_FOR_FLASH_SALE:
    '__deleted__/requested-products-for-flash-sale',
  APPROVE_FLASH_SALE_REQUESTED_PRODUCTS:
    '__deleted__/approve-flash-sale-requested-products',
  DISAPPROVE_FLASH_SALE_REQUESTED_PRODUCTS:
    '__deleted__/disapprove-flash-sale-requested-products',
  /** @deprecated A9 — no store-notices in Kolshi */
  STORE_NOTICES: '__deleted__/store-notices',
  STORE_NOTICES_IS_READ: '__deleted__/store-notices/read',
  STORE_NOTICE_GET_STORE_NOTICE_TYPE: '__deleted__/store-notices/type',
  STORE_NOTICES_USER_OR_SHOP_LIST: '__deleted__/store-notices/notify',
  /** @deprecated A9 — no FAQs CMS in Kolshi */
  FAQS: '__deleted__/faqs',
  /** @deprecated A9 — no terms-and-conditions CMS in Kolshi */
  TERMS_AND_CONDITIONS: '__deleted__/terms-and-conditions',
  APPROVE_TERMS_AND_CONDITIONS: '__deleted__/approve-terms-and-conditions',
  DISAPPROVE_TERMS_AND_CONDITIONS:
    '__deleted__/disapprove-terms-and-conditions',
  /** @deprecated A9 — no refund-policies in Kolshi */
  REFUND_POLICIES: '__deleted__/refund-policies',
  REFUND_REASONS: '__deleted__/refund-reasons',
  /** @deprecated A9 — no conversations/messages in Kolshi */
  CONVERSIONS: '__deleted__/conversations',
  MESSAGE: '__deleted__/messages',
  MESSAGE_SEEN: '__deleted__/messages/seen',
  /** @deprecated A9 — no become-seller in Kolshi */
  BECAME_SELLER: '__deleted__/became-seller',
  /** @deprecated A9 — no ownership-transfer in Kolshi */
  TRANSFER_SHOP_OWNERSHIP: '__deleted__/transfer-shop-ownership',
  OWNERSHIP_TRANSFER: '__deleted__/ownership-transfer',
  /** @deprecated A9 — no AI description generation in Kolshi */
  GENERATE_DESCRIPTION: '__deleted__/generate-descriptions',
  /** @deprecated A9 — no abusive-reports in Kolshi */
  ABUSIVE_REPORTS: '__deleted__/abusive_reports',
  ABUSIVE_REPORTS_DECLINE: '__deleted__/abusive_reports/reject',
  /** @deprecated A9 — no Q&A in Kolshi */
  QUESTIONS: '__deleted__/questions',
  /** @deprecated A9 — no wallet/points in Kolshi */
  ADD_WALLET_POINTS: '__deleted__/add-points',
  /** @deprecated A9 — no license-key in Kolshi */
  ADD_LICENSE_KEY_VERIFY: '__deleted__/license-key/verify',
  /** @deprecated A9 — no admin user-list (use USERS) */
  ADMIN_LIST: '__deleted__/admin/list',
  VENDORS_LIST: '__deleted__/vendors/list',
  CUSTOMERS: '__deleted__/customers/list',
  /** @deprecated A9 — admin order create/checkout flow removed */
  CHECKOUT: '__deleted__/orders/checkout/verify',
  ORDER_CREATE: '__deleted__/order/create',
  ORDER_INVOICE_DOWNLOAD: '__deleted__/download-invoice-url',
  UPDATE_EMAIL: '__deleted__/update-email',
  /** @deprecated A9 — analytics endpoints replaced by /system/status + /analytics/shops */
  TOP_RATED_PRODUCTS: '__deleted__/top-rate-product',
  VENDOR_STAFFS: '__deleted__/vendor-staffs',
  PRODUCT_INVENTORY: '__deleted__/products-stock',
  CATEGORY_WISE_PRODUCTS_STATS: '__deleted__/category-wise-product',
};

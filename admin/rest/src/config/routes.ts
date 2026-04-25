export const Routes = {
  dashboard: '/',
  login: '/login',
  logout: '/logout',
  /** @deprecated A.10 — admin registration is disabled in Kolshi; redirect to login. */
  register: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  adminMyShops: '/my-shops',
  profile: '/profile',
  verifyCoupons: '/coupons/verify',
  settings: '/settings',
  /** @deprecated A9 — settings sub-pages deleted; Kolshi uses dynamic /settings. */
  paymentSettings: '/settings',
  /** @deprecated A9 */
  seoSettings: '/settings',
  /** @deprecated A9 */
  eventSettings: '/settings',
  /** @deprecated A9 */
  shopSettings: '/settings',
  /** @deprecated A9 */
  companyInformation: '/settings',
  /** @deprecated A9 */
  maintenance: '/settings',
  /** @deprecated A9 */
  promotionPopup: '/settings',
  storeSettings: '/vendor/settings',
  storeKeepers: '/vendor/store_keepers',
  profileUpdate: '/profile-update',
  checkout: '/orders/checkout',
  verifyEmail: '/verify-email',
  /** @deprecated A.13 — verify-license page deleted; redirect to dashboard. */
  verifyLicense: '/',
  user: {
    ...routesFactory('/users'),
  },
  /** @deprecated A9 — types/groups page deleted. */
  type: {
    ...routesFactory('/groups'),
  },
  category: {
    ...routesFactory('/categories'),
  },
  /** @deprecated A9 — attributes page deleted. */
  attribute: {
    ...routesFactory('/attributes'),
  },
  /** @deprecated A9 */
  attributeValue: {
    ...routesFactory('/attribute-values'),
  },
  /** @deprecated A9 — tags page deleted. */
  tag: {
    ...routesFactory('/tags'),
  },
  reviews: {
    ...routesFactory('/reviews'),
  },
  /** @deprecated A9 — abusive reports not supported in Kolshi. */
  abuseReviews: {
    ...routesFactory('/abusive_reports'),
  },
  /** @deprecated A9 */
  abuseReviewsReport: {
    ...routesFactory('/abusive_reports/reject'),
  },
  /** @deprecated A9 — authors page deleted. */
  author: {
    ...routesFactory('/authors'),
  },
  coupon: {
    ...routesFactory('/coupons'),
  },
  /** @deprecated A9 — manufacturers page deleted. */
  manufacturer: {
    ...routesFactory('/manufacturers'),
  },
  order: {
    ...routesFactory('/orders'),
  },
  orderStatus: {
    ...routesFactory('/order-status'),
  },
  /** @deprecated A9 — admin order-create page deleted. */
  orderCreate: {
    ...routesFactory('/orders/create'),
  },
  product: {
    ...routesFactory('/products'),
  },
  shop: {
    ...routesFactory('/shops'),
  },
  /** @deprecated A9 — taxes page deleted. */
  tax: {
    ...routesFactory('/taxes'),
  },
  /** @deprecated A9 — shippings page deleted. */
  shipping: {
    ...routesFactory('/shippings'),
  },
  withdraw: {
    ...routesFactory('/withdraws'),
  },
  staff: {
    ...routesFactory('/staffs'),
  },
  /** @deprecated A9 — refunds page deleted; Kolshi refunds handled via order detail. */
  refund: {
    ...routesFactory('/refunds'),
  },
  /** @deprecated A9 — questions page deleted. */
  question: {
    ...routesFactory('/questions'),
  },
  /** @deprecated A9 — messaging deleted (Pusher removed). */
  message: {
    ...routesFactory('/message'),
  },
  /** @deprecated A9 */
  shopMessage: {
    ...routesFactory('/shop-message'),
  },
  /** @deprecated A9 */
  conversations: {
    ...routesFactory('/message/conversations'),
  },
  /** @deprecated A9 — store notices deleted. */
  storeNotice: {
    ...routesFactory('/store-notices'),
  },
  /** @deprecated A9 */
  storeNoticeRead: {
    ...routesFactory('/store-notices/read'),
  },
  notifyLogs: {
    ...routesFactory('/notify-logs'),
  },
  /** @deprecated A9 — FAQs page deleted. */
  faqs: {
    ...routesFactory('/faqs'),
  },
  /** @deprecated A9 — refund policies page deleted. */
  refundPolicies: {
    ...routesFactory('/refund-policies'),
  },
  /** @deprecated A9 — refund reasons page deleted. */
  refundReasons: {
    ...routesFactory('/refund-reasons'),
  },
  newShops: '/new-shops',
  draftProducts: '/products/draft',
  outOfStockOrLowProducts: '/products/product-stock',
  productInventory: '/products/inventory',
  /** @deprecated A9 — standalone transaction page deleted. */
  transaction: '/orders',
  /** @deprecated A9 — terms and conditions page deleted. */
  termsAndCondition: {
    ...routesFactory('/terms-and-conditions'),
  },
  adminList: '/users/admins',
  vendorList: '/users/vendors',
  pendingVendorList: '/users/vendors/pending',
  customerList: '/users/customer',
  myStaffs: '/users/my-staffs',
  vendorStaffs: '/users/vendor-staffs',
  /** @deprecated A9 — flash-sale page deleted. */
  flashSale: {
    ...routesFactory('/flash-sale'),
  },
  /** @deprecated A9 — store-notice page deleted. */
  ownerDashboardNotice: '/settings',
  /** @deprecated A9 — owner messaging page deleted. */
  ownerDashboardMessage: '/settings',
  ownerDashboardMyShop: '/my-shop',
  /** @deprecated A9 */
  myProductsInFlashSale: '/flash-sale/my-products',
  ownerDashboardNotifyLogs: '/notify-logs',
  inventory: {
    editWithoutLang: (slug: string, shop?: string) => {
      return shop ? `/${shop}/products/${slug}/edit` : `/products/${slug}/edit`;
    },
    edit: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}/products/${slug}/edit`
        : `/${language}/products/${slug}/edit`;
    },
    translate: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}/products/${slug}/translate`
        : `/${language}/products/${slug}/translate`;
    },
  },
  visitStore: (slug: string) => `${process.env.NEXT_PUBLIC_SHOP_URL}/${slug}`,
  /** @deprecated A9 */
  vendorRequestForFlashSale: {
    ...routesFactory('/flash-sale/vendor-request'),
  },
  /** @deprecated A9 — become-seller page deleted. */
  becomeSeller: '/',
  /** @deprecated A9 — shop ownership transfer deleted. */
  ownershipTransferRequest: {
    ...routesFactory('/shop-transfer'),
  },
  /** @deprecated A9 */
  ownerDashboardShopTransferRequest: '/',
};

function routesFactory(endpoint: string) {
  return {
    list: `${endpoint}`,
    create: `${endpoint}/create`,
    editWithoutLang: (slug: string, shop?: string) => {
      return shop
        ? `/${shop}${endpoint}/${slug}/edit`
        : `${endpoint}/${slug}/edit`;
    },
    edit: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}${endpoint}/${slug}/edit`
        : `${language}${endpoint}/${slug}/edit`;
    },
    translate: (slug: string, language: string, shop?: string) => {
      return shop
        ? `/${language}/${shop}${endpoint}/${slug}/translate`
        : `${language}${endpoint}/${slug}/translate`;
    },
    details: (slug: string) => `${endpoint}/${slug}`,
    editByIdWithoutLang: (id: string, shop?: string) => {
      return shop ? `/${shop}${endpoint}/${id}/edit` : `${endpoint}/${id}/edit`;
    },
  };
}

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
  /** Kolshi H.2 — public tracking page. */
  trackOrder: '/track-order',
  help: '/help',
  logout: '/logout',
  coupons: '/offers',
  products: '/products',
  product: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  privacy: '/privacy',
  terms: '/terms',
  refundPolicies: '/refund-policies',
  customerRefundPolicies: '/customer-refund-policies',
  vendorRefundPolicies: '/vendor-refund-policies',
  contactUs: '/contact',
  shops: '/shops',
  shop: (slug: string) => `/shops/${encodeURIComponent(slug)}`,
  nearByShop: ({ lat, lng }: { lat: string; lng: string }) =>
    `/shops/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
      lng,
    )}`,
  search: '/search',
  wishlists: '/wishlists',
  notifyLogs: '/notification',
  notifyLogsSingle: (id: string) => `/notification/${encodeURIComponent(id)}`,
  becomeSeller: '/become-seller',
  /* ─────────────────────────────────────────────────────────────────────
   * Deprecated / not-implemented routes retained to avoid breaking legacy
   * components still referenced elsewhere in the tree. See the feature
   * decision log for verdicts — these paths are expected to resolve to
   * 404 at runtime because the backing pages were removed.
   * ──────────────────────────────────────────────────────────────────── */
  refunds: '#',
  cards: '#',
  downloads: '#',
  authors: '#',
  author: (_slug: string) => '#',
  manufacturers: '#',
  manufacturer: (_slug: string) => '#',
  questions: '#',
  reports: '#',
  flashSale: '#',
  flashSaleSingle: (_slug: string) => '#',
  checkoutDigital: '/checkout',
  checkoutGuest: '/checkout',
};

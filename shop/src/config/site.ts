import { Routes } from '@/config/routes';

export const siteSettings = {
  name: 'PickBazar',
  description: '',
  logo: {
    url: '/logo.svg',
    alt: 'PickBazar',
    href: '/grocery',
    width: 128,
    height: 40,
  },
  defaultLanguage: 'en',
  currencyCode: 'USD',
  product: {
    placeholderImage: '/product-placeholder.svg',
    cardMaps: {
      grocery: 'Krypton',
      furniture: 'Radon',
      bag: 'Oganesson',
      makeup: 'Neon',
      book: 'Xenon',
      medicine: 'Helium',
      default: 'Argon',
    },
  },
  // Kolshi S2 scope: profile, orders, notifications, wishlist, checkout.
  // Legacy entries (refunds / questions / reports / downloads / cards / help /
  // change-password) are pruned per the decision log §B.4 and §A.6.
  authorizedLinks: [
    { href: Routes.profile, label: 'auth-menu-profile' },
    { href: Routes.orders, label: 'auth-menu-my-orders' },
    { href: Routes.wishlists, label: 'profile-sidebar-my-wishlist' },
    { href: Routes.checkout, label: 'auth-menu-checkout' },
  ],
  authorizedLinksMobile: [
    { href: Routes.profile, label: 'auth-menu-profile' },
    { href: Routes.notifyLogs, label: 'profile-sidebar-notifications' },
    { href: Routes.orders, label: 'auth-menu-my-orders' },
    { href: Routes.wishlists, label: 'profile-sidebar-my-wishlist' },
    { href: Routes.checkout, label: 'auth-menu-checkout' },
  ],
  dashboardSidebarMenu: [
    { href: Routes.profile, label: 'profile-sidebar-profile' },
    { href: Routes.notifyLogs, label: 'profile-sidebar-notifications' },
    { href: Routes.orders, label: 'profile-sidebar-orders' },
    { href: Routes.wishlists, label: 'profile-sidebar-my-wishlist' },
    { href: Routes.logout, label: 'profile-sidebar-logout' },
  ],
  sellingAdvertisement: {
    image: {
      src: '/selling.png',
      alt: 'Selling Advertisement',
    },
  },
  cta: {
    mockup_img_src: '/mockup-img.png',
    play_store_link: '/',
    app_store_link: '/',
  },
  // Kolshi S3 scope: browsing experience only. Out-of-scope entries —
  // flash-sale (D.9 Delete), authors / manufacturers (D.7-D.8 Delete),
  // vendor refund policies (F.7 Delete), help / become-seller / per-
  // site FAQ & terms (L.x Delete) — are pruned here so the header
  // menu no longer renders their links. The underlying routes still
  // resolve until S6 deletes the page components.
  headerLinks: [
    { href: Routes.shops, icon: null, label: 'nav-menu-shops' },
    { href: Routes.coupons, icon: null, label: 'nav-menu-offer' },
    { href: Routes.contactUs, label: 'nav-menu-contact' },
  ],
  footer: {
    // copyright: {
    //   name: 'RedQ, Inc',
    //   href: 'https://redq.io/',
    // },
    // address: '2429 River Drive, Suite 35 Cottonhall, CA 2296 United Kingdom',
    // email: 'dummy@dummy.com',
    // phone: '+1 256-698-0694',
    // Footer is reduced to Kolshi-supported surfaces: storefronts,
    // offers, privacy, and contact. Authors / manufacturers / flash
    // deals / vendor refund policies are removed (D.7-D.9, F.7 Delete).
    menus: [
      {
        title: 'text-explore',
        links: [
          {
            name: 'Shops',
            href: Routes.shops,
          },
          {
            name: 'Coupon',
            href: Routes.coupons,
          },
        ],
      },
      {
        title: 'text-our-information',
        links: [
          {
            name: 'Privacy policies',
            href: Routes.privacy,
          },
          {
            name: 'text-contact-us',
            href: Routes.contactUs,
          },
        ],
      },
    ],
    // payment_methods: [
    //   {
    //     img: '/payment/master.png',
    //     url: '/',
    //   },
    //   {
    //     img: '/payment/skrill.png',
    //     url: '/',
    //   },
    //   {
    //     img: '/payment/paypal.png',
    //     url: '/',
    //   },
    //   {
    //     img: '/payment/visa.png',
    //     url: '/',
    //   },
    //   {
    //     img: '/payment/discover.png',
    //     url: '/',
    //   },
    // ],
  },
};

import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  ownerAndStaffOnly,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';

export const siteSettings = {
  name: 'PickBazar',
  description: '',
  logo: {
    url: '/logo.svg',
    alt: 'PickBazar',
    href: '/',
    width: 138,
    height: 34,
  },
  collapseLogo: {
    url: '/collapse-logo.svg',
    alt: 'P',
    href: '/',
    width: 32,
    height: 32,
  },
  defaultLanguage: 'en',
  author: {
    name: 'RedQ',
    websiteUrl: 'https://redq.io',
    address: '',
  },
  headerLinks: [],
  authorizedLinks: [
    {
      href: Routes.profileUpdate,
      labelTransKey: 'authorized-nav-item-profile',
      icon: 'UserIcon',
      permission: adminOwnerAndStaffOnly,
    },
    {
      href: Routes.shop.create,
      labelTransKey: 'common:text-create-shop',
      icon: 'ShopIcon',
      permission: adminAndOwnerOnly,
    },

    {
      href: Routes.settings,
      labelTransKey: 'authorized-nav-item-settings',
      icon: 'SettingsIcon',
      permission: adminOnly,
    },
    {
      href: Routes.logout,
      labelTransKey: 'authorized-nav-item-logout',
      icon: 'LogOutIcon',
      permission: adminOwnerAndStaffOnly,
    },
  ],
  currencyCode: 'USD',
  sidebarLinks: {
    admin: {
      root: {
        href: Routes.dashboard,
        label: 'Main',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: Routes.dashboard,
            label: 'sidebar-nav-item-dashboard',
            icon: 'DashboardIcon',
          },
        ],
      },

      shop: {
        href: '',
        label: 'text-shop-management',
        icon: 'ShopIcon',
        childMenu: [
          {
            href: '',
            label: 'sidebar-nav-item-shops',
            icon: 'ShopIcon',
            childMenu: [
              {
                href: Routes.shop.list,
                label: 'text-all-shops',
                icon: 'MyShopIcon',
              },
              {
                href: Routes.shop.create,
                label: 'text-add-all-shops',
                icon: 'ShopIcon',
              },
              {
                href: Routes.newShops,
                label: 'text-inactive-shops',
                icon: 'MyShopIcon',
              },
            ],
          },
          {
            href: Routes.adminMyShops,
            label: 'sidebar-nav-item-my-shops',
            icon: 'MyShopIcon',
          },
        ],
      },

      product: {
        href: '',
        label: 'text-product-management',
        icon: 'ProductsIcon',
        childMenu: [
          {
            href: '',
            label: 'sidebar-nav-item-products',
            icon: 'ProductsIcon',
            childMenu: [
              {
                href: Routes.product.list,
                label: 'text-all-products',
                icon: 'ProductsIcon',
              },
              {
                href: Routes.draftProducts,
                label: 'text-my-draft-products',
                icon: 'ProductsIcon',
              },
              {
                href: Routes.outOfStockOrLowProducts,
                label: 'text-all-out-of-stock',
                icon: 'ProductsIcon',
              },
            ],
          },
          {
            href: Routes.productInventory,
            label: 'text-inventory',
            icon: 'InventoryIcon',
          },
          {
            href: Routes.category.list,
            label: 'sidebar-nav-item-categories',
            icon: 'CategoriesIcon',
          },
        ],
      },

      financial: {
        href: '',
        label: 'text-e-commerce-management',
        icon: 'WithdrawIcon',
        childMenu: [
          {
            href: Routes.withdraw.list,
            label: 'sidebar-nav-item-withdraws',
            icon: 'WithdrawIcon',
          },
        ],
      },

      order: {
        href: Routes.order.list,
        label: 'text-order-management',
        icon: 'OrdersIcon',
        childMenu: [
          {
            href: Routes.order.list,
            label: 'sidebar-nav-item-orders',
            icon: 'OrdersIcon',
          },
        ],
      },

      user: {
        href: '',
        label: 'text-user-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.user.list,
            label: 'text-all-users',
            icon: 'UsersIcon',
          },
          {
            href: Routes.adminList,
            label: 'text-admin-list',
            icon: 'AdminListIcon',
          },
          {
            href: '',
            label: 'text-vendors',
            icon: 'VendorsIcon',
            childMenu: [
              {
                href: Routes.vendorList,
                label: 'text-all-vendors',
                icon: 'UsersIcon',
              },
              {
                href: Routes.pendingVendorList,
                label: 'text-pending-vendors',
                icon: 'UsersIcon',
              },
            ],
          },
          {
            href: Routes.customerList,
            label: 'text-customers',
            icon: 'CustomersIcon',
          },
        ],
      },

      feedback: {
        href: '',
        label: 'text-feedback-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.reviews.list,
            label: 'sidebar-nav-item-reviews',
            icon: 'ReviewIcon',
          },
        ],
      },

      promotional: {
        href: '',
        label: 'text-promotional-management',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: '',
            label: 'sidebar-nav-item-coupons',
            icon: 'CouponsIcon',
            childMenu: [
              {
                href: Routes.coupon.list,
                label: 'text-all-coupons',
                icon: 'CouponsIcon',
              },
              {
                href: Routes.coupon.create,
                label: 'text-new-coupon',
                icon: 'CouponsIcon',
              },
            ],
          },
        ],
      },

      monitoring: {
        href: '',
        label: 'text-site-management',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.settings,
            label: 'sidebar-nav-item-settings',
            icon: 'SettingsIcon',
          },
          {
            href: Routes.ownerDashboardNotifyLogs,
            label: 'sidebar-nav-item-notify-logs',
            icon: 'StoreNoticeIcon',
          },
        ],
      },
    },

    shop: {
      root: {
        href: '',
        label: 'text-main',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: (shop: string) => `${Routes.dashboard}${shop}`,
            label: 'sidebar-nav-item-dashboard',
            icon: 'DashboardIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      product: {
        href: '',
        label: 'text-product-management',
        icon: 'ProductsIcon',
        permissions: adminOwnerAndStaffOnly,
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.product.list}`,
            label: 'sidebar-nav-item-products',
            icon: 'ProductsIcon',
            childMenu: [
              {
                href: (shop: string) => `/${shop}${Routes.product.list}`,
                label: 'text-all-products',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) => `/${shop}${Routes.product.create}`,
                label: 'text-new-products',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) => `/${shop}${Routes.draftProducts}`,
                label: 'text-my-draft',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) =>
                  `/${shop}${Routes.outOfStockOrLowProducts}`,
                label: 'text-all-out-of-stock',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
            ],
          },
          {
            href: (shop: string) => `/${shop}${Routes.productInventory}`,
            label: 'text-inventory',
            icon: 'InventoryIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      financial: {
        href: '',
        label: 'text-financial-management',
        icon: 'WithdrawIcon',
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.withdraw.list}`,
            label: 'sidebar-nav-item-withdraws',
            icon: 'WithdrawIcon',
            permissions: adminAndOwnerOnly,
          },
        ],
      },

      order: {
        href: '',
        label: 'text-order-management',
        icon: 'OrdersIcon',
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.order.list}`,
            label: 'sidebar-nav-item-orders',
            icon: 'OrdersIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      feedback: {
        href: '',
        label: 'text-feedback-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.reviews.list}`,
            label: 'sidebar-nav-item-reviews',
            icon: 'ReviewIcon',
            permissions: adminAndOwnerOnly,
          },
        ],
      },

      user: {
        href: '',
        label: 'text-user-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.staff.list}`,
            label: 'sidebar-nav-item-staffs',
            icon: 'UsersIcon',
            permissions: adminAndOwnerOnly,
          },
        ],
      },
    },

    staff: {
      root: {
        href: '',
        label: 'text-main',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: (shop: string) => `${Routes.dashboard}${shop}`,
            label: 'sidebar-nav-item-dashboard',
            icon: 'DashboardIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      product: {
        href: '',
        label: 'text-product-management',
        icon: 'ProductsIcon',
        permissions: adminOwnerAndStaffOnly,
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.product.list}`,
            label: 'sidebar-nav-item-products',
            icon: 'ProductsIcon',
            childMenu: [
              {
                href: (shop: string) => `/${shop}${Routes.product.list}`,
                label: 'text-all-products',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) => `/${shop}${Routes.product.create}`,
                label: 'text-new-products',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) => `/${shop}${Routes.draftProducts}`,
                label: 'text-my-draft',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
              {
                href: (shop: string) =>
                  `/${shop}${Routes.outOfStockOrLowProducts}`,
                label: 'text-low-out-of-stock',
                icon: 'ProductsIcon',
                permissions: adminOwnerAndStaffOnly,
              },
            ],
          },
          {
            href: (shop: string) => `/${shop}${Routes.productInventory}`,
            label: 'text-inventory',
            icon: 'InventoryIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      order: {
        href: '',
        label: 'text-order-management',
        icon: 'OrdersIcon',
        childMenu: [
          {
            href: (shop: string) => `/${shop}${Routes.order.list}`,
            label: 'sidebar-nav-item-orders',
            icon: 'OrdersIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },
    },

    ownerDashboard: [
      {
        href: Routes.dashboard,
        label: 'sidebar-nav-item-dashboard',
        icon: 'DashboardIcon',
        permissions: ownerAndStaffOnly,
      },
      {
        href: Routes?.ownerDashboardMyShop,
        label: 'common:sidebar-nav-item-my-shops',
        icon: 'MyShopOwnerIcon',
        permissions: ownerAndStaffOnly,
      },
    ],
  },
  product: {
    placeholder: '/product-placeholder.svg',
  },
  avatar: {
    placeholder: '/avatar-placeholder.svg',
  },
};

export const socialIcon = [
  {
    value: 'FacebookIcon',
    label: 'Facebook',
  },
  {
    value: 'InstagramIcon',
    label: 'Instagram',
  },
  {
    value: 'TwitterIcon',
    label: 'Twitter',
  },
  {
    value: 'YouTubeIcon',
    label: 'Youtube',
  },
];

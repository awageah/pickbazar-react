import { Item } from '@/store/quick-cart/cart.utils';
import type { NextPage } from 'next';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

/**
 * Kolshi S6 — shop-frontend type catalogue.
 *
 * Legacy Pickbazar types (authors / manufacturers / flash-sales / refunds /
 * store-notices / FAQs / terms CMS / questions / abuse-reports / downloads /
 * become-seller / payment-intents / saved cards / wallet / contact-us) have
 * been pruned. A small number of fields on `Product` / `Order` / `User` are
 * kept as `?: T` so legacy template components keep compiling; Kolshi never
 * populates them, so the guarded branches never render.
 */

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  authenticationRequired?: boolean;
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface GetParams {
  slug: string;
  language?: string;
}

export interface Success {
  success: boolean;
  message: string;
}

export type LayoutProps = {
  readonly children: ReactNode;
};

export interface HomePageProps {
  variables: {
    products: any;
    popularProducts?: any;
    bestSellingProducts?: any;
    categories: any;
    types: any;
    layoutSettings: any;
  };
  layout: string;
}

export interface SearchParamOptions {
  type: string;
  name: string;
  categories: string;
  tags: string;
  author: string;
  price: string;
  manufacturer: string;
  status: string;
  is_active: string;
  shop_id: string;
  min_price: string;
  max_price: string;
  rating: string;
  question: string;
  notice: string;
  faq_type: string;
  issued_by: string;
  title: string;
  target: string;
  shops: string;
  visibility: string;
}

export interface QueryOptions {
  /**
   * Optional because most Kolshi endpoints don't accept a `language` query
   * param — the backend localises responses via the `Accept-Language`
   * header. Kept for compatibility with legacy SSR helpers that still pass
   * it through.
   */
  language?: string;
  page?: number;
  limit?: number;
  /**
   * Wildcard catch-all kept for compatibility with the legacy Pickbazar
   * client (which accepts `Partial<T> & Record<string, unknown>` at call
   * sites). Without this, concrete sub-types can't be passed directly to
   * the HTTP client without a cast.
   */
  [key: string]: unknown;
}

export interface PaginatorInfo<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Attachment {
  id: number;
  original: string;
  thumbnail: string;
  __typename?: string;
  slug?: string;
}

/**
 * Kolshi-native sort keys accepted by `GET /products?sortBy=`.
 *
 * Template callers still pass the old `"created_at:desc"` / `"price:asc"`
 * shapes; `sort-mapper.ts` translates those into one of these values
 * before the request leaves the axios instance.
 */
export type KolshiProductSort =
  | 'newest'
  | 'popular'
  | 'rating'
  | 'price_asc'
  | 'price_desc';

export interface ProductQueryOptions extends QueryOptions {
  // ── Kolshi-native filters ───────────────────────────────────────────
  shopId?: string | number;
  categoryId?: string | number;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  minRating?: number;
  inStock?: boolean;
  sortBy?: KolshiProductSort;
  language?: string;

  // ── Legacy Pickbazar filters (translated by `format-products-args`) ──
  shop_id?: string;
  sortedBy?: string;
  orderBy?: string;
  name?: string;
  categories?: string;
  tags?: string;
  type?: string;
  manufacturer?: string;
  author?: string;
  price?: string;
  min_price?: string;
  max_price?: string;
  searchType?: string;
  searchQuery?: string;
  text?: string;
  visibility?: string;
}

export interface PopularProductQueryOptions extends QueryOptions {
  language?: string;
  type_slug?: string;
  with?: string;
  range?: number;
  shopId?: string | number;
  categoryId?: string | number;
}

export interface BestSellingProductQueryOptions extends QueryOptions {
  language?: string;
  type_slug?: string;
  with?: string;
  range?: number;
  shopId?: string | number;
  categoryId?: string | number;
}

export interface CategoryQueryOptions extends QueryOptions {
  language?: string;
  parent?: string | null;
  type?: string;
  rootsOnly?: boolean;
  parentId?: string | number;
}

/**
 * Review-summary envelope used by the product-detail pages.
 *
 * Kolshi returns a richer payload (`ReviewSummaryDTO`) than the legacy
 * Pickbazar shape: rating breakdown is keyed by 1–5 and augmented with
 * verified / with-images / with-responses counts. We keep the legacy
 * fields (`average`, `total`, `breakdown`) required so existing
 * components keep compiling; the Kolshi-specific fields are optional.
 */
export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  verifiedPurchases?: number;
  withImages?: number;
  withResponses?: number;
}

/**
 * Vote payload accepted by `POST /reviews/{reviewId}/vote`.
 * Mirrors `com.kolshi.review.enums.VoteType`.
 */
export type ReviewVoteType = 'HELPFUL' | 'NOT_HELPFUL';

/**
 * Shop-owner response embedded on a Kolshi review (read-only on the
 * shop-frontend — creation/deletion lives on admin).
 */
export interface KolshiReviewResponseDTO {
  id: number | string;
  reviewId: number | string;
  shopOwnerId?: number | string;
  shopOwnerName?: string;
  responseText: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string | number;
  url: string;
  position?: number;
  is_primary?: boolean;
}

export interface ProductVariation {
  id: string | number;
  sku?: string;
  title?: string;
  price?: number;
  sale_price?: number;
  quantity?: number;
  is_enabled?: boolean;
  variation_options?: Record<string, string | number>;
}

export interface TypeQueryOptions extends QueryOptions {
  language: string;
  name: string;
  orderBy: any;
}

export interface ShopQueryOptions extends QueryOptions {
  name: string;
  is_active: number;
}

export interface CouponQueryOptions extends QueryOptions {
  name: string;
  orderBy: string;
  code: string;
  shop_id: string;
}

export interface OrderQueryOptions extends QueryOptions {
  name: string;
  orderBy: string;
}

/**
 * Query options for `GET /reviews/product/{productId}` (Kolshi).
 *
 * Legacy fields (`orderBy`, `sortedBy`) are accepted and silently
 * translated by the client; prefer `sortBy` + native filter flags for
 * new call sites.
 */
export interface ReviewQueryOptions extends QueryOptions {
  product_id: string;
  rating?: string | number;
  verifiedOnly?: boolean;
  withImages?: boolean;
  sortBy?: 'helpful' | 'rating' | 'date';
  orderBy?: string;
  sortedBy?: string;
}

export interface SettingsQueryOptions extends QueryOptions {}

export interface WishlistQueryOptions extends QueryOptions {}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  /** Kolshi never populates `author`; kept optional for legacy `Book` card compat. */
  author?: Author;
  /** Kolshi never populates `manufacturer`; kept optional for legacy compat. */
  manufacturer?: Manufacturer;
  tags: Tag[];
  is_digital: boolean;
  is_external: boolean;
  external_product_url: string;
  external_product_button_text: string;
  product_type: string;
  description: string;
  type: Type;
  price: number;
  sale_price: number;
  min_price: number;
  max_price: number;
  image: Attachment;
  status: string;
  gallery: Attachment[];
  shop: Shop;
  unit: string;
  categories: Category[];
  quantity: number;
  total_reviews: number;
  ratings: number;
  in_wishlist: boolean;
  variations: object[];
  variation_options: object[];
  rating_count: RatingCount[];
  related_products: Product[];
  created_at: string;
  updated_at: string;
  language: string;
  video?: {
    url: string;
  }[];
  /** Kolshi has no flash-sale feature; kept optional so cart/item legacy UI compiles. */
  in_flash_sale?: boolean;
}

export interface RatingCount {
  rating: number;
  total: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: Attachment;
  parent_id?: number | null;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: Attachment;
}

export interface Type {
  id: string;
  name: string;
  slug?: any;
  banners: Banner[];
  icon?: string;
  promotional_sliders: Attachment[];
  settings: {
    isHome: boolean;
    layoutType: string;
    productCard?: string;
    bestSelling: {
      enable?: boolean;
      title?: string;
    };
    popularProducts: {
      enable?: boolean;
      title?: string;
    };
    category: {
      enable?: boolean;
      title?: string;
    };
    handpickedProducts: {
      enable?: boolean;
      title?: string;
      products?: Product[];
      enableSlider?: boolean;
    };
    newArrival: {
      enable?: boolean;
      title?: string;
    };
    authors: {
      enable?: boolean;
      title?: string;
    };
    manufactures: {
      enable?: boolean;
      title?: string;
    };
  };
}

export interface ShopAddress {
  country: string;
  city: string;
  state: string;
  zip: string;
  street_address: string;
}

export interface Shop {
  __typename?: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: Attachment;
  logo?: Attachment;
  is_active?: boolean;
  distance?: number;
  address: UserAddress;
  settings?: {
    contact?: string;
    socials?: any;
    location?: GoogleMapLocation;
    website?: string;
    isShopUnderMaintenance: boolean;
    shopMaintenance: {
      image: Attachment;
      title: string;
      description: string;
      start: string;
      until: string;
    };
  };
  notifications?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

/**
 * Kolshi never returns author / manufacturer objects — these interfaces
 * are kept only so the legacy book card / book-details component keep
 * type-checking the `?.slug` / `?.name` lookups they perform on
 * `product.author` / `product.manufacturer`.
 */
export interface Author {
  id: string;
  name: string;
  slug: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}
export interface Coupon {
  id: string;
  code: string;
  description: string;
  translated_languages: string[];
  orders: Order[];
  type: string;
  image: Attachment;
  amount: number;
  active_from: string;
  expire_at: string;
  created_at: string;
  updated_at: string;
  target?: boolean;
  shop_id?: string;
  is_approve?: boolean;
  is_valid?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Maintenance {
  image: any;
  title: string;
  description: string;
  start: string;
  until: string;
}

export interface Settings {
  id: string;
  name: string;
  slug: string;
  options: {
    [key: string]: any;
  };
}

export interface Order {
  id: number | string;
  tracking_number: string;
  customer_id: number | string;
  customer_name: string;
  customer_contact: string;
  customer?: User;
  amount: number;
  children: Order[];
  sales_tax: number;
  total: number;
  paid_total: number;
  coupon?: Coupon;
  discount?: number;
  delivery_fee?: number;
  delivery_time?: string;
  products: Product[];
  created_at: Date;
  updated_at: Date;
  billing_address?: Address;
  shipping_address?: Address;
  language?: string;
  order_status: string;
  payment_status: string;
  payment_gateway: string;
  reviews?: Review[];
}

export interface VerifyCouponInputType {
  code: string;
  sub_total: number;
  item: Item[];
}

export interface VerifyCouponResponse {
  is_valid: boolean;
  coupon?: Coupon;
  message?: string;
}

/**
 * Review creation payload.
 *
 * Kolshi contract (`POST /reviews`):
 *   { productId, rating (1-5), comment?, orderId?, imageUrls?: string[] }
 *
 * We keep the legacy Pickbazar fields (`shop_id`, `variation_option_id`,
 * `photos: Attachment[]`) optional so the template's review form keeps
 * compiling; the client adapter translates to the Kolshi payload.
 */
export interface CreateReviewInput {
  product_id: string | number;
  shop_id?: string | number;
  order_id?: string | number;
  variation_option_id?: string | number;
  comment?: string;
  rating: number;
  photos?: Attachment[];
  imageUrls?: string[];
}

export interface UpdateReviewInput extends CreateReviewInput {
  id: string | number;
}

/**
 * Legacy stub preserved so compile targets that still import
 * `ReviewResponse` keep working. Not returned by any Kolshi endpoint
 * — use `KolshiReviewResponseDTO` for the real shop-owner reply.
 */
export interface ReviewResponse {
  product_id: string;
}

/**
 * Vote on a review. `reviewId` is injected path-side by the client.
 * `voteType === null` is the sentinel used by `removeVote`.
 */
export interface VoteReviewInput {
  reviewId: string | number;
  voteType: ReviewVoteType;
}

/**
 * Payment gateways Kolshi actually supports. The legacy `PaymentGateway`
 * enum listed 14 providers; Kolshi today ships Cash-on-Delivery and
 * Stripe only (handoff Flow 5). Additional providers will be reintroduced
 * via feature flags as the backend adds support.
 */
export enum PaymentGateway {
  STRIPE = 'STRIPE',
  COD = 'CASH_ON_DELIVERY',
  CASH = 'CASH',
  FULL_WALLET_PAYMENT = 'FULL_WALLET_PAYMENT',
}

export enum OrderStatus {
  PENDING = 'order-pending',
  PROCESSING = 'order-processing',
  COMPLETED = 'order-completed',
  CANCELLED = 'order-cancelled',
  REFUNDED = 'order-refunded',
  FAILED = 'order-failed',
  AT_LOCAL_FACILITY = 'order-at-local-facility',
  OUT_FOR_DELIVERY = 'order-out-for-delivery',
}

export enum PaymentStatus {
  PENDING = 'payment-pending',
  PROCESSING = 'payment-processing',
  SUCCESS = 'payment-success',
  FAILED = 'payment-failed',
  REVERSAL = 'payment-reversal',
  REFUNDED = 'payment-refunded',
  COD = 'cash-on-delivery',
  AWAITING_FOR_APPROVAL = 'payment-awaiting-for-approval',
}

/**
 * Kolshi flattens addresses to a single `address: string` field.
 * `address.address` (nested object) is retained ONLY so legacy consumers
 * that haven't been migrated yet keep compiling; S2 code must not read it.
 */
export enum KolshiAddressType {
  Shipping = 'SHIPPING',
  Billing = 'BILLING',
}

export interface Address {
  id: string | number;
  title: string;
  /** Kolshi: flat string. Legacy nested object kept optional for back-compat. */
  address:
    | string
    | {
        __typename?: string;
        country: string;
        city: string;
        state: string;
        zip: string;
        street_address: string;
      };
  type: KolshiAddressType | string;
  is_default?: boolean;
  location?: GoogleMapLocation;
}

export interface CreateAddressInput {
  title: string;
  address: string;
  type: KolshiAddressType;
  is_default?: boolean;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;

export interface UpdateProfileInput {
  avatar?: string | null;
  bio?: string | null;
  contact?: string | null;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  is_active?: boolean;
  permissions?: string[];
  email_verified?: boolean;
  /** Legacy Pickbazar wallet object — Kolshi returns `null`. */
  wallet?: {
    total_points: number;
    points_used: number;
    available_points: number;
  } | null;
  profile?: {
    id?: string | number;
    user_id?: string | number;
    contact?: string;
    bio?: string;
    avatar?: string | Attachment;
  };
  /** Kolshi field. */
  addresses?: Address[];
  /** Legacy alias still read by a few un-migrated components. */
  address?: Address[];
  shops?: Shop[];
  created_at?: string;
  updated_at?: string;
  last_order?: Order;
}

export interface UpdateUserInput extends Partial<User> {
  id: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordUserInput {
  email: string;
}

/**
 * Kolshi accepts only `{ token, newPassword }` on `/auth/reset-password`.
 * `email` and legacy `password` remain optional so the form can keep
 * populating them without type errors — the client drops them before send.
 */
export interface ResetPasswordUserInput {
  token: string;
  newPassword: string;
  password?: string;
  email?: string;
}

export interface VerifyForgotPasswordUserInput {
  token: string;
  email?: string;
}

export interface ChangePasswordUserInput {
  oldPassword: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationEmailInput {
  email: string;
}

export interface AuthResponse {
  token: string;
  permissions: string[];
  role?: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * OTP login is a "coming-soon" stub in Kolshi — the backend has no OTP
 * endpoints yet. The UI form is wired behind `settings.useOtp` (defaults
 * to `false` in Kolshi) so the template compiles but nothing dispatches.
 */
export interface OtpLoginInputType {
  phone_number: string;
  code: string;
  otp_id: string;
  name?: string;
  email?: string;
}

export interface ConnectProductOrderPivot {
  product_id: number;
  variation_option_id?: number;
  order_quantity: number;
  unit_price: number;
  subtotal: number;
}

/**
 * Wishlist item.
 *
 * Kolshi's `WishlistDTO` is `{ id, userId, product, createdAt }` — we
 * keep the legacy `product_id` / `user_id` fields so existing selectors
 * keep compiling; the client adapter back-fills them from the nested
 * `product`.
 */
export interface Wishlist {
  id: string | number;
  product: Product;
  product_id?: string | number;
  user?: User[];
  user_id?: string | number;
  userId?: string | number;
  createdAt?: string;
}

export interface UserAddress {
  street_address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  billing_address?: Address;
  shipping_address?: Address;
}
export interface GoogleMapLocation {
  lat?: number | string;
  lng?: number | string;
  street_number?: string;
  route?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
  formatted_address?: string;
}
export interface ShopMapLocation {
  lat?: string;
  lng?: string;
  street_address?: string;
  formattedAddress?: string;
}

/**
 * Kolshi's `ReviewDTO` (flat, no nested `product`/`shop`/`user`) plus
 * `response` for the shop-owner reply and vote counters. The shop UI
 * still reads some of the legacy keys (`photos`,
 * `positive_feedbacks_count`, etc.) so we keep them as **optional** and
 * provide Kolshi-native twins side-by-side. The `adaptReview` helper in
 * `framework/rest/review.ts` copies Kolshi values into the legacy keys
 * so existing components keep rendering without changes.
 */
export interface Review {
  id: string | number;
  name?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;

  // ── Kolshi-native ───────────────────────────────────────────────────
  productId?: number | string;
  productName?: string;
  customerId?: number | string;
  customerName?: string;
  isVerifiedPurchase?: boolean;
  imageUrls?: string[];
  response?: KolshiReviewResponseDTO | null;
  helpfulCount?: number;
  notHelpfulCount?: number;
  currentUserVote?: ReviewVoteType | null;
  createdAt?: string;

  // ── Legacy Pickbazar shape (kept optional for compile-compat) ───────
  photos?: Attachment[];
  user?: User;
  product?: Product;
  shop?: Shop;
  positive_feedbacks_count?: number;
  negative_feedbacks_count?: number;
}

export interface CategoryPaginator extends PaginatorInfo<Category> {}
export interface ProductPaginator extends PaginatorInfo<Product> {}
export interface ShopPaginator extends PaginatorInfo<Shop> {}
export interface CouponPaginator extends PaginatorInfo<Coupon> {}
export interface OrderPaginator extends PaginatorInfo<Order> {}
export interface OrderStatusPaginator extends PaginatorInfo<OrderStatus> {}
export interface ReviewPaginator extends PaginatorInfo<Review> {}
export interface WishlistPaginator extends PaginatorInfo<Wishlist> {}

/**
 * Notification record.
 *
 * Kolshi's `NotificationDTO` ships with a structured `type` /
 * `channel` / `status` triplet plus `subject` / `body`. The shop UI
 * reads `notify_text`/`is_read`/`created_at` — we alias those onto
 * the Kolshi fields in the adapter (`adaptNotification`) so every
 * render path keeps working.
 *
 * Read state is tracked client-side (localStorage) because the
 * backend has no mark-as-read endpoint yet. `is_read` is derived from
 * that local set in `useNotifyLogs`.
 */
export interface NotifyLogs {
  id: string | number;
  // ── Kolshi-native ───────────────────────────────────────────────────
  type?: string;
  channel?: string;
  status?: string;
  recipientId?: string | number;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  subject?: string | null;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | number | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  retryCount?: number | null;
  createdAt?: string;
  updatedAt?: string;

  // ── Legacy / adapter-derived ────────────────────────────────────────
  receiver?: string;
  sender?: string;
  notify_type?: string;
  notify_receiver_type?: string;
  is_read?: boolean;
  notify_text?: string;
  created_at: string;
}
export interface NotifyLogsQueryOptions extends QueryOptions {
  notify_type?: string;
  notify_receiver_type?: string;
  sender?: string;
  receiver?: string | number;
  set_all_read?: boolean;
  is_read?: boolean;
  orderBy?: string;
  sortedBy?: string;
}

export interface NotifyLogsPaginator extends PaginatorInfo<NotifyLogs> {}

/** Shape of `GET /notifications/count` — `{ count }`. */
export interface KolshiNotificationCount {
  count: number;
}

export type AlertProps = {
  message: string | null;
  variant?:
    | 'info'
    | 'warning'
    | 'error'
    | 'success'
    | 'infoOutline'
    | 'warningOutline'
    | 'errorOutline'
    | 'successOutline';
  closeable?: boolean;
  onClose?: React.Dispatch<React.SetStateAction<any>>;
  className?: string;
  children?: React.ReactNode;
  childClassName?: string;
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'normal' | 'outline' | 'custom' | 'dark';
  size?: 'big' | 'medium' | 'small';
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  href?: string;
}

/* ─────────────────────────────────────────────────────────────────────
 * Kolshi S4 — Cart / Orders / Coupons / Tracking types
 *
 * These interfaces model the actual wire format documented in
 * `KOLSHI_FRONTEND_HANDOFF.md`. Older Pickbazar-era types (`Order`,
 * `CreateOrderInput`, etc.) are kept above so existing components stay
 * compilable during the incremental rewrite; Kolshi-native consumers
 * should prefer the `Kolshi*` variants defined here.
 * ──────────────────────────────────────────────────────────────────── */

/** Single row inside a server cart as returned by `GET /cart`. */
export interface KolshiCartItem {
  id: number | string;
  product_id: number | string;
  variation_id?: number | string | null;
  quantity: number;
  unit_price: number;
  sale_price?: number | null;
  subtotal: number;
  name?: string;
  image?: string | null;
  slug?: string;
  shop_id?: number | string;
  shop?: Shop | null;
  product?: Product | null;
  variation?: ProductVariation | null;
  stock?: number;
  /** Kolshi returns `inStock` from the cart endpoint when available. */
  in_stock?: boolean;
  [key: string]: unknown;
}

/** `GET /cart` / server cart DTO. */
export interface KolshiCart {
  id?: number | string;
  user_id?: number | string;
  currency?: string;
  items: KolshiCartItem[];
  total: number;
  subtotal?: number;
  total_items: number;
  total_unique_items?: number;
  updated_at?: string;
  [key: string]: unknown;
}

/** Input payload for `POST /cart/items`. */
export interface AddToCartInput {
  product_id: number | string;
  variation_id?: number | string;
  quantity: number;
}

/** Input payload for `PUT /cart/items/{id}`. */
export interface UpdateCartItemInput {
  quantity: number;
}

/** Input payload for `POST /coupons/validate`. */
export interface KolshiValidateCouponInput {
  code: string;
  sub_total: number;
  shop_id?: number | string;
}

/** Response shape for `POST /coupons/validate`. */
export interface KolshiValidateCouponResponse {
  is_valid: boolean;
  message?: string;
  coupon?: Coupon;
  discount?: number;
  discount_type?: 'percentage' | 'fixed' | 'free_shipping';
}

/** Input payload for `POST /coupons/best-match`. */
export interface KolshiBestMatchCouponInput {
  sub_total: number;
  shop_id?: number | string;
}

/** Kolshi-native sort keys for orders. */
export type KolshiOrderSort = 'newest' | 'oldest';

/**
 * Kolshi order state machine (handoff Flow 4 / 6):
 *   ORDER_RECEIVED → PROCESSING → AT_LOCAL_FACILITY → OUT_FOR_DELIVERY
 *   → COMPLETED, or CANCELLED before AT_LOCAL_FACILITY.
 */
export enum KolshiOrderStatus {
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  PROCESSING = 'PROCESSING',
  AT_LOCAL_FACILITY = 'AT_LOCAL_FACILITY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Payment gateways Kolshi actually supports. */
export enum KolshiPaymentGateway {
  COD = 'CASH_ON_DELIVERY',
  STRIPE = 'STRIPE',
}

/** `POST /orders` payload — customer-driven checkout. */
export interface KolshiCreateOrderInput {
  delivery_fee?: number;
  delivery_time?: string;
  shipping_address?: string;
  billing_address?: string;
  note?: string;
  coupon_code?: string;
  payment_gateway: string;
  customer_contact?: string;
  customer_name?: string;
}

/** Single row in the history log for an order. */
export interface KolshiOrderHistoryEntry {
  id: number | string;
  status: string;
  note?: string | null;
  created_at: string;
  actor?: string | null;
}

/** Response of `GET /tracking/{trackingNumber}?contact=`. */
export interface KolshiTrackingResponse {
  tracking_number: string;
  order_status: string;
  payment_status?: string;
  estimated_delivery?: string;
  history: KolshiOrderHistoryEntry[];
  shop?: {
    id: number | string;
    name: string;
    slug?: string;
  } | null;
}

/** Query params for `GET /orders`. */
export interface KolshiOrderQueryOptions extends QueryOptions {
  status?: string;
  tracking_number?: string;
  sortBy?: KolshiOrderSort;
  /** Legacy pass-through — mapped to `sortBy` by the hook layer. */
  orderBy?: string;
  sortedBy?: string;
}

import type {
  AuthResponse,
  BestSellingProductQueryOptions,
  Category,
  CategoryPaginator,
  CategoryQueryOptions,
  CreateReviewInput,
  ForgotPasswordUserInput,
  GetParams,
  LoginUserInput,
  NotifyLogs,
  NotifyLogsQueryOptions,
  Order,
  OrderPaginator,
  OrderQueryOptions,
  PopularProductQueryOptions,
  Product,
  ProductPaginator,
  ProductQueryOptions,
  RegisterUserInput,
  ResetPasswordUserInput,
  Review,
  ReviewQueryOptions,
  Settings,
  SettingsQueryOptions,
  Shop,
  ShopPaginator,
  ShopQueryOptions,
  Type,
  TypeQueryOptions,
  UpdateReviewInput,
  User,
  VerifyForgotPasswordUserInput,
  Wishlist,
  WishlistQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import type {
  AddToCartInput,
  KolshiBestMatchCouponInput,
  KolshiCart,
  KolshiCreateOrderInput,
  KolshiNotificationCount,
  KolshiOrderHistoryEntry,
  KolshiOrderQueryOptions,
  KolshiReviewResponseDTO,
  KolshiTrackingResponse,
  KolshiValidateCouponInput,
  KolshiValidateCouponResponse,
  ProductImage,
  ProductVariation,
  ReviewSummary,
  UpdateCartItemInput,
  VoteReviewInput,
} from '@/types';
import { resolveSortBy } from '../utils/sort-mapper';

/**
 * Kolshi REST client.
 *
 * Shape rationale:
 *   - Modules are grouped by backend resource (products / reviews /
 *     shops / …) so the call-sites in `framework/rest/*` read like
 *     REST paths.
 *   - Every method documents the exact backend route it resolves to;
 *     shape adapters (Pickbazar ⇄ Kolshi) live next to the call so
 *     the hook layer stays dumb.
 *   - Features deleted in S6 (authors, manufacturers, flash-sales,
 *     refunds, store notices, faqs, terms, become-seller, newsletter,
 *     abuse-reports, product Q&A, saved cards, payment intents,
 *     guest checkout, multipart uploads, social/OTP auth) no longer
 *     have entries here — consumers have been removed or rewired to
 *     Coming-Soon placeholders. Re-add a resource when the backend
 *     adds the endpoint AND a UI surface consumes it.
 */
class Client {
  products = {
    /**
     * `GET /products` — Kolshi's main catalogue endpoint.
     *
     * Callers still pass the template's vocabulary (`shop_id`, `min_price`,
     * `categories`, etc.); `formatProductsArgs` has already translated most
     * of that to `shopId` / `categoryId` / `minPrice` / `sortBy`. We strip
     * the remaining legacy keys here so they never reach the wire.
     */
    all: ({
      type: _type,
      author: _author,
      manufacturer: _manufacturer,
      tags: _tags,
      visibility: _visibility,
      searchJoin: _searchJoin,
      with: _with,
      orderBy: _orderBy,
      sortedBy: _sortedBy,
      name: _name,
      price: _price,
      min_price: _min_price,
      max_price: _max_price,
      categories: _categories,
      shop_id: _shop_id,
      sortBy,
      ...params
    }: Partial<ProductQueryOptions> & Record<string, unknown>) =>
      HttpClient.get<ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
        ...params,
        sortBy: resolveSortBy(sortBy, 'newest'),
        isActive: params.isActive ?? true,
      }),

    /** `GET /products?sortBy=popular` — replaces legacy `/products/popular`. */
    popular: ({
      limit = 10,
      type_slug: _typeSlug,
      with: _with,
      range: _range,
      ...params
    }: Partial<PopularProductQueryOptions> & Record<string, unknown>) =>
      HttpClient.get<Product[] | ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
        ...params,
        limit,
        sortBy: 'popular',
        isActive: true,
      }),

    /** `GET /products?sortBy=popular` (alias — Kolshi has no dedicated best-selling endpoint). */
    bestSelling: ({
      limit = 10,
      type_slug: _typeSlug,
      with: _with,
      range: _range,
      ...params
    }: Partial<BestSellingProductQueryOptions> & Record<string, unknown>) =>
      HttpClient.get<Product[] | ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
        ...params,
        limit,
        sortBy: 'popular',
        isActive: true,
      }),

    /** `GET /products?sortBy=newest` — new-arrivals shelf. */
    newArrivals: ({
      limit = 10,
      ...params
    }: Partial<ProductQueryOptions> & Record<string, unknown>) =>
      HttpClient.get<Product[] | ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
        ...params,
        limit,
        sortBy: 'newest',
        isActive: true,
      }),

    /** `GET /products/slug/{slug}`. */
    get: ({ slug, language }: GetParams) =>
      HttpClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/slug/${slug}`, {
        language,
      }),

    /** `GET /products/{id}/images`. */
    images: (id: string | number) =>
      HttpClient.get<ProductImage[]>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/images`,
      ),

    /** `GET /products/{id}/variations?enabledOnly=true`. */
    variations: (id: string | number, enabledOnly = true) =>
      HttpClient.get<ProductVariation[]>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/variations`,
        { enabledOnly },
      ),

    /** `GET /reviews/products/{id}/summary`. */
    reviewSummary: (id: string | number) =>
      HttpClient.get<ReviewSummary>(
        `${API_ENDPOINTS.PRODUCTS_REVIEWS}/products/${id}/summary`,
      ),

    /** `GET /products/{id}/related`. */
    related: (id: string | number, params?: Record<string, unknown>) =>
      HttpClient.get<Product[]>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/related`,
        params,
      ),

    /** `GET /products/{id}/frequently-bought-together`. */
    frequentlyBoughtTogether: (
      id: string | number,
      params?: Record<string, unknown>,
    ) =>
      HttpClient.get<Product[]>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/frequently-bought-together`,
        params,
      ),

    /** `GET /products/recently-viewed`. */
    recentlyViewed: (params?: Record<string, unknown>) =>
      HttpClient.get<Product[]>(
        API_ENDPOINTS.PRODUCTS_RECENTLY_VIEWED,
        params,
      ),

    /** `DELETE /products/recently-viewed` — "clear history" from the PDP. */
    clearRecentlyViewed: () =>
      HttpClient.delete<void>(API_ENDPOINTS.PRODUCTS_RECENTLY_VIEWED),

    /** `POST /products/{id}/track-view` — fire-and-forget on PDP mount. */
    trackView: (id: string | number) =>
      HttpClient.post<void>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/track-view`,
        {},
      ),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Reviews — Kolshi I.1
   *
   * Paginated reads go through `HttpClient.getPaginated` so the caller
   * keeps working with the template's 1-indexed `PaginatorInfo<T>` shape
   * while the wire contract (`page`, `size`, `PageResponse<T>`) flows
   * through Spring unchanged. Writes accept Pickbazar-shaped payloads
   * and translate to Kolshi's `CreateReviewRequest` here so the review
   * form component can stay ignorant of the wire format.
   *
   * Note: the rating sort / filter vocabulary ("helpful" / "rating" /
   * "date") matches the Kolshi controller exactly; a legacy `sortedBy`
   * caller is translated at the hook layer.
   * ───────────────────────────────────────────────────────────── */
  reviews = {
    /**
     * `GET /reviews/product/{productId}`.
     * Accepts filters `rating`, `verifiedOnly`, `withImages`, `sortBy`.
     */
    all: ({
      product_id,
      rating,
      verifiedOnly,
      withImages,
      sortBy,
      orderBy: _orderBy,
      sortedBy: _sortedBy,
      ...params
    }: ReviewQueryOptions) =>
      HttpClient.getPaginated<Review>(
        `${API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT}/${product_id}`,
        {
          ...params,
          ...(rating !== undefined && rating !== null && rating !== ''
            ? { rating: Number(rating) }
            : {}),
          ...(verifiedOnly ? { verifiedOnly: true } : {}),
          ...(withImages ? { withImages: true } : {}),
          ...(sortBy ? { sortBy } : {}),
        },
      ),

    /** `GET /reviews/{reviewId}`. */
    get: ({ id }: { id: string | number }) =>
      HttpClient.get<Review>(`${API_ENDPOINTS.PRODUCTS_REVIEWS}/${id}`),

    /**
     * `POST /reviews`. Accepts the Pickbazar-shaped payload but ships a
     * Kolshi-native body (`productId`, `rating`, `comment`, `orderId`,
     * `imageUrls`). Legacy fields like `shop_id` / `variation_option_id`
     * / `photos` are intentionally dropped — Kolshi derives shop-id
     * server-side and has no variation-level review concept.
     */
    create: (input: CreateReviewInput) =>
      HttpClient.post<Review>(
        API_ENDPOINTS.PRODUCTS_REVIEWS,
        toKolshiReviewPayload(input),
      ),

    /**
     * Kolshi has no `PUT /reviews/{id}` — the template's "update" flow
     * is implemented as a delete-then-create round-trip inside the
     * framework hook. Keeping this stub so any stray caller fails loud
     * with a typed error instead of silently POSTing the wrong shape.
     */
    update: (_input: UpdateReviewInput) =>
      Promise.reject<Review>(
        new Error(
          'Review update is not supported by Kolshi — delete and re-create.',
        ),
      ),

    /** `DELETE /reviews/{reviewId}`. Author or admin only. */
    delete: (id: string | number) =>
      HttpClient.delete<void>(`${API_ENDPOINTS.PRODUCTS_REVIEWS}/${id}`),

    /** `GET /reviews/products/{productId}/summary`. */
    summary: (productId: string | number) =>
      HttpClient.get<ReviewSummary>(
        `${API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY}/${productId}/summary`,
      ),

    /** `GET /reviews/products/{productId}/rating`. */
    rating: (productId: string | number) =>
      HttpClient.get<{
        productId: number;
        averageRating: number;
        totalReviews: number;
      }>(`${API_ENDPOINTS.PRODUCT_REVIEWS_RATING}/${productId}/rating`),

    /** `POST /reviews/{reviewId}/vote`. */
    vote: ({ reviewId, voteType }: VoteReviewInput) =>
      HttpClient.post<void>(
        `${API_ENDPOINTS.REVIEW_VOTE}/${reviewId}/vote`,
        { voteType },
      ),

    /** `DELETE /reviews/{reviewId}/vote`. */
    removeVote: (reviewId: string | number) =>
      HttpClient.delete<void>(
        `${API_ENDPOINTS.REVIEW_VOTE}/${reviewId}/vote`,
      ),

    /** `GET /reviews/{reviewId}/response`. */
    getResponse: (reviewId: string | number) =>
      HttpClient.get<KolshiReviewResponseDTO | null>(
        `${API_ENDPOINTS.REVIEW_RESPONSE}/${reviewId}/response`,
      ),
  };

  categories = {
    /**
     * `GET /categories` (paginated). Kolshi doesn't scope categories by
     * `type`, so the legacy `type` filter is dropped silently.
     *
     * The template's `parent` contract ("all" / "null" / numeric id) is
     * honoured client-side:
     *   - `"null"` / `null` → roots-only via `/categories/roots`
     *   - numeric / string id → children via `/categories/{id}/children`
     *   - otherwise → the plain paginated endpoint
     */
    all: async ({
      type: _type,
      parent,
      parentId,
      rootsOnly,
      ...params
    }: Partial<CategoryQueryOptions> & Record<string, unknown>) => {
      if (rootsOnly || parent === null || parent === 'null') {
        const roots = await HttpClient.get<Category[]>(
          API_ENDPOINTS.CATEGORIES_ROOTS,
          params,
        );
        return wrapListAsPaginator(roots) as unknown as CategoryPaginator;
      }
      if (parentId || (parent && parent !== 'all')) {
        const children = await HttpClient.get<Category[]>(
          `${API_ENDPOINTS.CATEGORIES}/${parentId ?? parent}/children`,
          params,
        );
        return wrapListAsPaginator(children) as unknown as CategoryPaginator;
      }
      return HttpClient.get<CategoryPaginator>(
        API_ENDPOINTS.CATEGORIES,
        params,
      );
    },

    /** `GET /categories/tree`. */
    tree: (params?: Record<string, unknown>) =>
      HttpClient.get<Category[]>(API_ENDPOINTS.CATEGORIES_TREE, params),

    /** `GET /categories/roots`. */
    roots: (params?: Record<string, unknown>) =>
      HttpClient.get<Category[]>(API_ENDPOINTS.CATEGORIES_ROOTS, params),

    /** `GET /categories/slug/{slug}`. */
    bySlug: (slug: string, params?: Record<string, unknown>) =>
      HttpClient.get<Category>(
        `${API_ENDPOINTS.CATEGORIES}/slug/${slug}`,
        params,
      ),

    /** `GET /categories/{id}/children`. */
    children: (id: string | number, params?: Record<string, unknown>) =>
      HttpClient.get<Category[]>(
        `${API_ENDPOINTS.CATEGORIES}/${id}/children`,
        params,
      ),
  };

  /**
   * Kolshi deleted the template's `/types` catalogue (decision log E.5).
   * The shop's homepage driver, header/menu and several SSR prefetches
   * still read `types.all()` / `types.get()` to pick a layout and seed
   * the banner. Instead of rewriting all of them at once, we return a
   * single synthetic "Kolshi" type with the classic layout so every
   * existing consumer keeps rendering. The actual `/types` endpoint is
   * never called — when all callers migrate to reading layout metadata
   * from `/settings`, this shim can be deleted alongside them.
   */
  types = {
    all: async (_params?: Partial<TypeQueryOptions>): Promise<Type[]> => [
      KOLSHI_DEFAULT_TYPE,
    ],
    get: async ({ slug }: { slug: string; language: string }): Promise<Type> =>
      ({ ...KOLSHI_DEFAULT_TYPE, slug: slug || KOLSHI_DEFAULT_TYPE.slug }),
  };

  shops = {
    /** `GET /shops` (paginated). Legacy `is_active`/search prefix stripped. */
    all: ({
      is_active: _isActive,
      name,
      ...params
    }: Partial<ShopQueryOptions> & Record<string, unknown>) =>
      HttpClient.get<ShopPaginator>(API_ENDPOINTS.SHOPS, {
        isActive: true,
        ...(name ? { searchTerm: String(name) } : {}),
        ...params,
      }),

    /** `GET /shops/slug/{slug}`. */
    get: (slug: string) =>
      HttpClient.get<Shop>(`${API_ENDPOINTS.SHOPS}/slug/${slug}`),

    /** `GET /shops/search?searchTerm=…`. */
    search: (searchTerm: string, params?: Record<string, unknown>) =>
      HttpClient.get<ShopPaginator>(`${API_ENDPOINTS.SHOPS}/search`, {
        searchTerm,
        ...params,
      }),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Coupons — Kolshi F.5 / K.1
   *
   * `/coupons/validate` is the single server-side check the checkout
   * runs before applying a code. `/coupons/best-match` is an optional
   * recommender that returns the most valuable coupon the customer
   * currently qualifies for.
   *
   * The legacy paginated `GET /coupons` listing is not exposed — in
   * Kolshi it is `super_admin`-only, so the public `/offers` page has
   * been removed (see decision log K.1). Customers discover coupons
   * through the checkout "Use best offer" button.
   * ───────────────────────────────────────────────────────────── */
  coupons = {
    /**
     * `POST /coupons/validate` — Kolshi contract. Returns
     * `{ is_valid, coupon?, discount?, message? }` so the UI can surface
     * both the savings and the server-side reason on rejection.
     */
    validate: (input: KolshiValidateCouponInput) =>
      HttpClient.post<KolshiValidateCouponResponse>(
        API_ENDPOINTS.COUPONS_VALIDATE,
        input,
      ),

    /** `POST /coupons/best-match` — optional recommender. */
    bestMatch: (input: KolshiBestMatchCouponInput) =>
      HttpClient.post<KolshiValidateCouponResponse>(
        API_ENDPOINTS.COUPONS_BEST_MATCH,
        input,
      ),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Cart — Kolshi F.1
   *
   * The cart is server-owned. Every mutation round-trips; the client
   * uses React-Query for optimistic updates (see `framework/rest/cart`).
   * Guest carts do not exist — hooks must gate behind auth (F.2).
   * ───────────────────────────────────────────────────────────── */
  cart = {
    /** `GET /cart` — returns the live server cart for the logged-in user. */
    get: () => HttpClient.get<KolshiCart>(API_ENDPOINTS.CART),

    /** `POST /cart/items` — idempotent on (productId, variationId). */
    addItem: (input: AddToCartInput) =>
      HttpClient.post<KolshiCart>(API_ENDPOINTS.CART_ITEMS, input),

    /** `PUT /cart/items/{id}` — absolute (not delta) quantity. */
    updateItem: (id: number | string, input: UpdateCartItemInput) =>
      HttpClient.put<KolshiCart>(`${API_ENDPOINTS.CART_ITEMS}/${id}`, input),

    /** `DELETE /cart/items/{id}`. */
    removeItem: (id: number | string) =>
      HttpClient.delete<KolshiCart | void>(
        `${API_ENDPOINTS.CART_ITEMS}/${id}`,
      ),

    /** `DELETE /cart` — wipes the entire cart. */
    clear: () => HttpClient.delete<KolshiCart | void>(API_ENDPOINTS.CART),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Orders — Kolshi F.3, G.1–G.4
   *
   * Key contract differences vs. Pickbazar:
   *   - `POST /orders` returns a **list** of `OrderDTO` (one per shop).
   *   - Order states follow ORDER_RECEIVED → … → COMPLETED / CANCELLED
   *     (no `order-pending` etc.). Admin transitions live under
   *     `/orders/{id}/{transition}` per handoff.
   *   - Refunds / payment-intent / saved cards / downloads /
   *     pre-checkout verification endpoints do NOT exist on Kolshi
   *     (H.1–H.3, D.8, F.6, F.7). Their hooks and stubs were removed
   *     in S6 so nothing here pretends to reach them.
   * ───────────────────────────────────────────────────────────── */
  orders = {
    /**
     * `GET /orders`. The template passes `orderBy`/`sortedBy` from the
     * dashboard filter UI — we translate to Kolshi's `sortBy` enum
     * without touching the caller. `with=` is dropped (no eager-load in
     * Kolshi).
     */
    all: ({
      orderBy: _orderBy,
      sortedBy: _sortedBy,
      with: _with,
      tracking_number,
      ...params
    }: Partial<KolshiOrderQueryOptions> &
      Partial<OrderQueryOptions> &
      Record<string, unknown>) =>
      HttpClient.get<OrderPaginator>(API_ENDPOINTS.ORDERS, {
        ...(tracking_number ? { tracking_number } : {}),
        ...params,
      }),

    /**
     * `GET /orders/{id}`. Kolshi deep-linking uses numeric order IDs,
     * but the template navigates by `tracking_number`. Both call sites
     * are routed through this method; the backend accepts either.
     */
    get: (idOrTracking: string | number) =>
      HttpClient.get<Order>(`${API_ENDPOINTS.ORDERS}/${idOrTracking}`),

    /**
     * `POST /orders`. Returns `Order[]` (one per shop). Callers must
     * handle the array shape — see `usePlaceOrderMutation`. Legacy
     * Pickbazar payloads are accepted at runtime; fields Kolshi ignores
     * are stripped silently rather than rejecting the request.
     */
    create: (input: KolshiCreateOrderInput) =>
      HttpClient.post<Order[]>(API_ENDPOINTS.ORDERS, input),

    /** `PUT /orders/{id}/cancel`. */
    cancel: (id: number | string, note?: string) =>
      HttpClient.put<Order>(
        `${API_ENDPOINTS.ORDERS}/${id}/cancel`,
        note ? { note } : {},
      ),

    /** `GET /orders/{id}/history`. */
    history: (id: number | string) =>
      HttpClient.get<KolshiOrderHistoryEntry[]>(
        `${API_ENDPOINTS.ORDERS}/${id}/history`,
      ),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Public tracking — Kolshi G.3 (`GET /tracking/{trackingNumber}?contact=`)
   *
   * The endpoint is unauthenticated but requires the customer contact
   * (phone/email) that was supplied at checkout as a weak shared secret.
   * ───────────────────────────────────────────────────────────── */
  tracking = {
    /** `GET /tracking/{trackingNumber}?contact=`. */
    get: (trackingNumber: string, contact?: string) =>
      HttpClient.get<KolshiTrackingResponse>(
        `${API_ENDPOINTS.TRACKING}/${encodeURIComponent(trackingNumber)}`,
        contact ? { contact } : undefined,
      ),
  };

  users = {
    // ─── Core auth (Kolshi A-section) ────────────────────────────────────
    me: () => HttpClient.get<User>(API_ENDPOINTS.USERS_ME),
    login: (input: LoginUserInput) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.USERS_LOGIN, input),
    register: (input: RegisterUserInput) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.USERS_REGISTER, input),

    forgotPassword: (input: ForgotPasswordUserInput) =>
      HttpClient.post<{ message: string }>(
        API_ENDPOINTS.USERS_FORGOT_PASSWORD,
        { email: input.email },
      ),
    /**
     * Kolshi exposes token validation as `GET /auth/validate-reset-token?token=`.
     * We translate the Pickbazar-shaped payload (`{ token, email }`) down to
     * the query param the backend actually consumes — `email` is ignored.
     */
    verifyForgotPasswordToken: (input: VerifyForgotPasswordUserInput) =>
      HttpClient.get<{ valid: boolean }>(
        API_ENDPOINTS.USERS_VERIFY_FORGOT_PASSWORD_TOKEN,
        { token: input.token },
      ),
    resetPassword: (input: ResetPasswordUserInput) =>
      HttpClient.post<{ message: string }>(
        API_ENDPOINTS.USERS_RESET_PASSWORD,
        {
          token: input.token,
          newPassword: input.newPassword ?? input.password,
        },
      ),

    verifyEmail: ({ token }: { token: string }) =>
      HttpClient.get<{ message: string }>(
        API_ENDPOINTS.AUTH_VERIFY_EMAIL,
        { token },
      ),
    resendVerificationEmail: (input: { email: string }) =>
      HttpClient.post<{ message: string }>(
        API_ENDPOINTS.SEND_VERIFICATION_EMAIL,
        { email: input.email },
      ),

    // ─── Profile (B1, B2) ────────────────────────────────────────────────
    updateProfile: (input: {
      avatar?: string | null;
      bio?: string | null;
      contact?: string | null;
    }) => HttpClient.put<User>(API_ENDPOINTS.ME_PROFILE, input),

    // ─── Addresses (B3–B8) ───────────────────────────────────────────────
    addresses: {
      all: () => HttpClient.get<any[]>(API_ENDPOINTS.ME_ADDRESSES),
      get: (id: string | number) =>
        HttpClient.get<any>(`${API_ENDPOINTS.ME_ADDRESSES}/${id}`),
      create: (input: {
        title: string;
        address: string;
        type: string;
        is_default?: boolean;
      }) => HttpClient.post<any>(API_ENDPOINTS.ME_ADDRESSES, input),
      update: (
        id: string | number,
        input: Partial<{
          title: string;
          address: string;
          type: string;
          is_default: boolean;
        }>,
      ) => HttpClient.put<any>(`${API_ENDPOINTS.ME_ADDRESSES}/${id}`, input),
      delete: (id: string | number) =>
        HttpClient.delete<void>(`${API_ENDPOINTS.ME_ADDRESSES}/${id}`),
      setDefault: (id: string | number) =>
        HttpClient.post<any>(
          `${API_ENDPOINTS.ME_ADDRESSES}/${id}/default`,
          {},
        ),
    },

    // ─── Kolshi has no server-side logout — caller drops the cookie. ─────
    logout: async () => Promise.resolve(true),
  };

  /* ───────────────────────────────────────────────────────────────────
   * Wishlist — Kolshi J.1
   *
   * Unlike Pickbazar, Kolshi has no single `toggle` endpoint — instead
   * it splits add/remove into POST/DELETE on `/wishlist/products/{id}`.
   * The framework-layer `useToggleWishlist` hook keeps the legacy API
   * by orchestrating add/remove based on the result of `check`.
   *
   * Deletion is by **productId**, not wishlist-row id. The legacy
   * `remove(id)` signature is retained as a thin wrapper so UI
   * components (which already pass the product ID) keep working.
   * ───────────────────────────────────────────────────────────── */
  wishlist = {
    /** `GET /wishlist`. Returns paginated `WishlistDTO` rows. */
    all: ({
      orderBy: _orderBy,
      sortedBy: _sortedBy,
      with: _with,
      ...params
    }: Partial<WishlistQueryOptions> & Record<string, unknown>) =>
      HttpClient.getPaginated<Wishlist>(API_ENDPOINTS.WISHLIST, params),

    /** `POST /wishlist/products/{productId}`. */
    add: (productId: string | number) =>
      HttpClient.post<Wishlist>(
        `${API_ENDPOINTS.WISHLIST_PRODUCTS}/${productId}`,
        {},
      ),

    /** `DELETE /wishlist/products/{productId}`. */
    remove: (productId: string | number) =>
      HttpClient.delete<void>(
        `${API_ENDPOINTS.WISHLIST_PRODUCTS}/${productId}`,
      ),

    /**
     * `GET /wishlist/products/{productId}/check` → `{ inWishlist: bool }`.
     * Returns a plain boolean to keep the legacy signature stable.
     */
    checkIsInWishlist: async ({
      product_id,
    }: {
      product_id: string | number;
    }) => {
      const res = await HttpClient.get<{ inWishlist: boolean }>(
        `${API_ENDPOINTS.WISHLIST_PRODUCTS}/${product_id}/check`,
      );
      return Boolean(res?.inWishlist);
    },

    /** `GET /wishlist/count` → `{ count: number }`. */
    count: () =>
      HttpClient.get<{ count: number }>(API_ENDPOINTS.WISHLIST_COUNT),

    /** `DELETE /wishlist` — clear the entire wishlist. */
    clear: () => HttpClient.delete<void>(API_ENDPOINTS.WISHLIST),

    /**
     * Legacy toggle — Kolshi has no atomic toggle, so this shim runs a
     * check-then-add/remove round-trip. Preserved for template call
     * sites (`useToggleWishlist`). Prefer `add` / `remove` for new code.
     */
    toggle: async (input: {
      product_id: string | number;
      language?: string;
    }) => {
      const isIn = await client.wishlist.checkIsInWishlist({
        product_id: input.product_id,
      });
      if (isIn) {
        await client.wishlist.remove(input.product_id);
        return { in_wishlist: false };
      }
      await client.wishlist.add(input.product_id);
      return { in_wishlist: true };
    },
  };

  settings = {
    /**
     * `GET /settings` returns a flat list of `{setting_key, setting_value,
     * category}` rows grouped into `FINANCIAL / PLATFORM / EMAIL /
     * SECURITY / DELIVERY`. Template consumers expect a dictionary under
     * `.options`, so we collapse the list here. `JSON`-shaped values are
     * parsed best-effort (e.g. nested `maintenance` object). Unknown
     * values are kept as strings.
     */
    all: async (_params?: SettingsQueryOptions): Promise<Settings> => {
      const raw = await HttpClient.get<
        | Array<{
            setting_key?: string;
            key?: string;
            setting_value?: unknown;
            value?: unknown;
            category?: string;
          }>
        | Settings
        | { data: any[] }
      >(API_ENDPOINTS.SETTINGS);

      const list: Array<{ key?: string; value?: unknown }> = Array.isArray(
        raw,
      )
        ? (raw as any[])
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];

      if (list.length === 0 && !Array.isArray(raw)) {
        // Backend already wraps the payload in `{ options: ... }` — use as-is.
        return raw as Settings;
      }

      const options: Record<string, unknown> = {};
      for (const row of list) {
        const k = (row as any).setting_key ?? (row as any).key;
        if (!k) continue;
        const rawValue = (row as any).setting_value ?? (row as any).value;
        options[k] = coerceSettingValue(rawValue);
      }

      return {
        id: 'kolshi-public-settings',
        name: 'Kolshi',
        slug: 'kolshi',
        options: options as Settings['options'],
      };
    },
  };

  /* ───────────────────────────────────────────────────────────────────
   * Notifications — Kolshi M.3
   *
   * The backend controller currently only exposes list / get-one /
   * count. There is no mark-as-read endpoint on the server; the shop
   * tracks read-state client-side through a localStorage-backed set
   * keyed by user-id (see `framework/rest/notify-logs.ts`). The legacy
   * `readNotifyLog` / `readAllNotifyLogs` hooks stay as resolved
   * Promises so UI mutations succeed (and locally flip read-state)
   * without hitting a 404.
   * ───────────────────────────────────────────────────────────── */
  notifyLogs = {
    /** `GET /notifications` — paginated list, newest first. */
    all: ({
      orderBy: _orderBy,
      sortedBy: _sortedBy,
      notify_type: _notifyType,
      notify_receiver_type: _notifyReceiverType,
      receiver: _receiver,
      sender: _sender,
      set_all_read: _setAllRead,
      is_read: _isRead,
      ...params
    }: Partial<NotifyLogsQueryOptions>) =>
      HttpClient.getPaginated<NotifyLogs>(
        API_ENDPOINTS.NOTIFY_LOGS,
        params as Record<string, unknown>,
      ),

    /** `GET /notifications/{id}`. */
    get: ({ id }: { id: string | number; language?: string }) =>
      HttpClient.get<NotifyLogs>(`${API_ENDPOINTS.NOTIFY_LOGS}/${id}`),

    /** `GET /notifications/count` → `{ count }`. */
    count: () =>
      HttpClient.get<KolshiNotificationCount>(
        API_ENDPOINTS.NOTIFICATIONS_COUNT,
      ),

    /**
     * Kolshi has no server-side mark-as-read. This resolves immediately
     * so the mutation hook can flip local state without hitting the
     * network.
     */
    readNotifyLog: (_input: { id: string | number }) =>
      Promise.resolve({} as NotifyLogs),

    /** See {@link readNotifyLog}. */
    readAllNotifyLogs: (_params: Partial<NotifyLogsQueryOptions> = {}) =>
      Promise.resolve(null as unknown),
  };
}

const client = new Client();

export default client;

/* ─────────────────────────────────────────────────────────────────────
 * Internal helpers — intentionally unexported. Grouped here so each
 * resource block above stays readable.
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Synthetic Kolshi "type" consumed by legacy homepage / SSR code paths.
 * Every section is enabled so the default layout shows categories,
 * popular + new-arrivals rails, and the hero banner. Banner/promo
 * slides default to empty arrays so the render loops are no-ops
 * until marketing seeds real assets through `/settings`.
 */
const KOLSHI_DEFAULT_TYPE: Type = {
  id: 'kolshi-default',
  name: 'Kolshi',
  slug: 'kolshi',
  banners: [] as any,
  promotional_sliders: [] as any,
  settings: {
    isHome: true,
    layoutType: 'classic',
    productCard: 'helium',
    bestSelling: { enable: true, title: 'text-best-selling-products' },
    popularProducts: { enable: true, title: 'text-popular-products' },
    category: { enable: true, title: 'text-categories' },
    handpickedProducts: { enable: false, title: '' },
    newArrival: { enable: true, title: 'text-new-arrivals' },
    authors: { enable: false, title: '' },
    manufactures: { enable: false, title: '' },
  },
};

/**
 * Coerces raw string setting values into richer JS types where possible.
 * Kolshi stores booleans / numbers / JSON as plain strings so we try
 * cheap parses in order of cost. Failures return the original value
 * untouched — consumers are defensive already.
 */
function coerceSettingValue(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (trimmed === '') return raw;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* keep as string */
    }
  }
  return raw;
}

/**
 * Translates the template's `CreateReviewInput` / `UpdateReviewInput`
 * into Kolshi's `CreateReviewRequest` contract.
 *
 *  - `productId` / `rating` are required.
 *  - `orderId` is forwarded when present so the backend can mark the
 *    review as a verified purchase.
 *  - `imageUrls` accepts the caller's already-uploaded Cloudinary URLs.
 *    If only legacy `Attachment[]` objects are supplied (with
 *    `original` / `thumbnail` URLs), we flatten them to a URL list.
 *  - `comment` is optional per the DTO but the shop form still
 *    requires it; leaving the forwarding permissive here so
 *    admin-authored payloads also work.
 */
function toKolshiReviewPayload(
  input: CreateReviewInput,
): Record<string, unknown> {
  const { product_id, order_id, comment, rating, imageUrls, photos } = input;
  const flattenedPhotos =
    Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : Array.isArray(photos)
      ? photos
          .map((p) =>
            typeof p === 'string' ? p : (p?.original ?? p?.thumbnail),
          )
          .filter((url): url is string => Boolean(url))
      : undefined;

  return {
    productId:
      typeof product_id === 'string' ? Number(product_id) : product_id,
    rating,
    ...(comment ? { comment } : {}),
    ...(order_id
      ? {
          orderId:
            typeof order_id === 'string' ? Number(order_id) : order_id,
        }
      : {}),
    ...(flattenedPhotos && flattenedPhotos.length > 0
      ? { imageUrls: flattenedPhotos.slice(0, 3) }
      : {}),
  };
}

/**
 * Synthesises a paginator envelope around a plain list so legacy
 * infinite-query consumers keep compiling while Kolshi returns simple
 * arrays (categories/roots/children). Total/`last_page` flag that the
 * result is the entire dataset — the caller's `getNextPageParam` stops
 * immediately.
 */
function wrapListAsPaginator<T>(list: T[] | null | undefined) {
  const data = Array.isArray(list) ? list : [];
  return {
    data,
    current_page: 1,
    last_page: 1,
    from: data.length > 0 ? 1 : 0,
    to: data.length,
    total: data.length,
    per_page: data.length,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
    links: [] as any[],
  };
}

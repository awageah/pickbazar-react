import type {
  Attachment,
  Author,
  AuthorPaginator,
  AuthorQueryOptions,
  AuthResponse,
  Category,
  CategoryPaginator,
  CategoryQueryOptions,
  ChangePasswordUserInput,
  CheckoutVerificationInput,
  CouponPaginator,
  CouponQueryOptions,
  CreateAbuseReportInput,
  CreateContactUsInput,
  CreateFeedbackInput,
  CreateOrderInput,
  CreateQuestionInput,
  CreateRefundInput,
  CreateReviewInput,
  DownloadableFilePaginator,
  Feedback,
  ForgotPasswordUserInput,
  LoginUserInput,
  Manufacturer,
  ManufacturerPaginator,
  ManufacturerQueryOptions,
  MyQuestionQueryOptions,
  MyReportsQueryOptions,
  Order,
  OrderPaginator,
  OrderQueryOptions,
  OrderStatusPaginator,
  OtpLoginInputType,
  OTPResponse,
  PasswordChangeResponse,
  PopularProductQueryOptions,
  Product,
  ProductPaginator,
  ProductQueryOptions,
  QueryOptions,
  QuestionPaginator,
  QuestionQueryOptions,
  Refund,
  RefundPaginator,
  RegisterUserInput,
  ResetPasswordUserInput,
  Review,
  ReviewPaginator,
  ReviewQueryOptions,
  ReviewResponse,
  SendOtpCodeInputType,
  Settings,
  Shop,
  ShopPaginator,
  ShopQueryOptions,
  SocialLoginInputType,
  TagPaginator,
  TagQueryOptions,
  Type,
  TypeQueryOptions,
  UpdateReviewInput,
  UpdateUserInput,
  User,
  VerifiedCheckoutData,
  VerifyCouponInputType,
  VerifyCouponResponse,
  VerifyForgotPasswordUserInput,
  VerifyOtpInputType,
  Wishlist,
  WishlistPaginator,
  WishlistQueryOptions,
  GetParams,
  SettingsQueryOptions,
  CreateOrderPaymentInput,
  SetupIntentInfo,
  PaymentIntentCollection,
  Card,
  BestSellingProductQueryOptions,
  UpdateEmailUserInput,
  EmailChangeResponse,
  VerificationEmailUserInput,
  StoreNoticeQueryOptions,
  StoreNoticePaginator,
  StoreNotice,
  FAQS,
  FaqsQueryOptions,
  FaqsPaginator,
  ShopMapLocation,
  RefundQueryOptions,
  RefundReasonPaginator,
  TermsAndConditionsQueryOptions,
  TermsAndConditionsPaginator,
  FlashSaleQueryOptions,
  FlashSalePaginator,
  FlashSale,
  RefundPolicyPaginator,
  RefundPolicyQueryOptions,
  SingleFlashSale,
  FlashSaleProductsQueryOptions,
  NotifyLogsQueryOptions,
  NotifyLogsPaginator,
  NotifyLogs,
  BecomeSeller,
  ShopMaintenanceEvent,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
//@ts-ignore
import { OTPVerifyResponse } from '@/types';
import type {
  ProductImage,
  ProductVariation,
  ReviewSummary,
} from '@/types';
import { resolveSortBy } from '../utils/sort-mapper';

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
      // legacy aliases — must never be forwarded to the backend.
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

    /** `GET /products?sortBy=popular` (alias of popular — Kolshi has no best-selling endpoint). */
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

    /** `DELETE /products/recently-viewed` — Kolshi's "clear history" hook. */
    clearRecentlyViewed: () =>
      HttpClient.delete<void>(API_ENDPOINTS.PRODUCTS_RECENTLY_VIEWED),

    /** `POST /products/{id}/track-view` — fire-and-forget on PDP mount. */
    trackView: (id: string | number) =>
      HttpClient.post<void>(
        `${API_ENDPOINTS.PRODUCTS}/${id}/track-view`,
        {},
      ),

    // ─── Legacy / Coming-Soon stubs (feature Delete in S6) ──────────────
    questions: ({ question, ...params }: QuestionQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.PRODUCTS_QUESTIONS, {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({
          question,
        }),
      }),
    createFeedback: (_input: CreateFeedbackInput) =>
      Promise.reject<Feedback>(
        new Error('Feedback is not supported in Kolshi.'),
      ),
    createAbuseReport: (_input: CreateAbuseReportInput) =>
      Promise.reject<Review>(
        new Error('Abuse reporting is not supported in Kolshi.'),
      ),
    createQuestion: (_input: CreateQuestionInput) =>
      Promise.reject<Review>(
        new Error('Questions are not supported in Kolshi.'),
      ),
    getProductsByFlashSale: ({ slug, language }: GetParams) => {
      return HttpClient.get<Product>(
        `${API_ENDPOINTS.PRODUCTS_BY_FLASH_SALE}`,
        {
          language,
          slug,
        },
      );
    },
  };
  myQuestions = {
    all: (params: MyQuestionQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.MY_QUESTIONS, {
        with: 'user',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
  };
  myReports = {
    all: (params: MyReportsQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.MY_REPORTS, {
        with: 'user',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
  };
  reviews = {
    all: ({ rating, ...params }: ReviewQueryOptions) =>
      HttpClient.get<ReviewPaginator>(API_ENDPOINTS.PRODUCTS_REVIEWS, {
        searchJoin: 'and',
        with: 'user',
        ...params,
        search: HttpClient.formatSearchParams({
          rating,
        }),
      }),
    get: ({ id }: { id: string }) =>
      HttpClient.get<Review>(`${API_ENDPOINTS.PRODUCTS_REVIEWS}/${id}`),
    create: (input: CreateReviewInput) =>
      HttpClient.post<ReviewResponse>(API_ENDPOINTS.PRODUCTS_REVIEWS, input),
    update: (input: UpdateReviewInput) =>
      HttpClient.put<ReviewResponse>(
        `${API_ENDPOINTS.PRODUCTS_REVIEWS}/${input.id}`,
        input,
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
  tags = {
    all: ({ type, ...params }: Partial<TagQueryOptions>) =>
      HttpClient.get<TagPaginator>(API_ENDPOINTS.TAGS, {
        searchJoin: 'and',
        ...params,
        ...(type && { search: HttpClient.formatSearchParams({ type }) }),
      }),
  };
  /**
   * Kolshi deleted the template's `/types` catalogue (decision log E.5).
   * The shop's homepage driver, header/menu, and several SSR prefetches
   * still read `types.all()` / `types.get()` to pick a layout and seed
   * the banner. Instead of rewriting all of them at once, we return a
   * single synthetic "Kolshi" type with the classic layout so every
   * existing consumer keeps rendering. The actual `/types` endpoint is
   * never called.
   *
   * S6 deletes this stub alongside the last `types` caller.
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

    // ─── Coming Soon / Delete stubs ──────────────────────────────────────
    searchNearShops: (_input: ShopMapLocation) =>
      Promise.reject<any>(
        new Error('Near-by shops are not supported in Kolshi.'),
      ),
    getSearchNearShops: (_input: ShopMapLocation) =>
      Promise.reject<any>(
        new Error('Near-by shops are not supported in Kolshi.'),
      ),
    shopMaintenanceEvent: (_input: ShopMaintenanceEvent) =>
      Promise.reject<Shop>(
        new Error('Shop maintenance toggle is not supported in Kolshi.'),
      ),
  };
  storeNotice = {
    all: ({ shop_id, shops, ...params }: Partial<StoreNoticeQueryOptions>) => {
      return HttpClient.get<StoreNoticePaginator>(API_ENDPOINTS.STORE_NOTICES, {
        searchJoin: 'and',
        shop_id: shop_id,
        ...params,
        search: HttpClient.formatSearchParams({ shop_id, shops }),
      });
    },
  };
  authors = {
    all: ({ name, ...params }: Partial<AuthorQueryOptions>) => {
      return HttpClient.get<AuthorPaginator>(API_ENDPOINTS.AUTHORS, {
        ...params,
        searchJoin: 'and',
        search: HttpClient.formatSearchParams({
          name,
        }),
      });
    },
    top: ({ type, ...params }: Partial<AuthorQueryOptions>) =>
      HttpClient.get<Author[]>(API_ENDPOINTS.AUTHORS_TOP, {
        ...params,
        search: HttpClient.formatSearchParams({
          type,
        }),
      }),
    get: ({ slug, language }: { slug: string; language?: string }) =>
      HttpClient.get<Author>(`${API_ENDPOINTS.AUTHORS}/${slug}`, {
        language,
      }),
  };
  manufacturers = {
    all: ({ name, type, ...params }: Partial<ManufacturerQueryOptions>) =>
      HttpClient.get<ManufacturerPaginator>(API_ENDPOINTS.MANUFACTURERS, {
        ...params,
        search: HttpClient.formatSearchParams({
          name,
          type,
        }),
      }),
    top: ({ type, ...params }: Partial<ManufacturerQueryOptions>) =>
      HttpClient.get<Manufacturer[]>(API_ENDPOINTS.MANUFACTURERS_TOP, {
        ...params,
        search: HttpClient.formatSearchParams({
          type,
        }),
      }),
    get: ({ slug, language }: { slug: string; language?: string }) =>
      HttpClient.get<Manufacturer>(`${API_ENDPOINTS.MANUFACTURERS}/${slug}`, {
        language,
      }),
  };
  coupons = {
    all: (params: Partial<CouponQueryOptions>) =>
      HttpClient.get<CouponPaginator>(API_ENDPOINTS.COUPONS, params),
    verify: (input: VerifyCouponInputType) =>
      HttpClient.post<VerifyCouponResponse>(
        API_ENDPOINTS.COUPONS_VERIFY,
        input,
      ),
  };
  orders = {
    all: (params: Partial<OrderQueryOptions>) =>
      HttpClient.get<OrderPaginator>(API_ENDPOINTS.ORDERS, {
        with: 'refund',
        ...params,
      }),
    get: (tracking_number: string) =>
      HttpClient.get<Order>(`${API_ENDPOINTS.ORDERS}/${tracking_number}`, {
        with: 'refund;reviews',
      }),
    create: (input: CreateOrderInput) =>
      HttpClient.post<Order>(API_ENDPOINTS.ORDERS, input),
    refunds: (params: Pick<QueryOptions, 'limit'>) =>
      HttpClient.get<RefundPaginator>(API_ENDPOINTS.ORDERS_REFUNDS, {
        with: 'refund_policy;order',
        ...params,
      }),
    createRefund: (input: CreateRefundInput) =>
      HttpClient.post<Refund>(API_ENDPOINTS.ORDERS_REFUNDS, input),
    payment: (input: CreateOrderPaymentInput) =>
      HttpClient.post<any>(API_ENDPOINTS.ORDERS_PAYMENT, input),
    savePaymentMethod: (input: any) =>
      HttpClient.post<any>(API_ENDPOINTS.SAVE_PAYMENT_METHOD, input),

    downloadable: (query?: OrderQueryOptions) =>
      HttpClient.get<DownloadableFilePaginator>(
        API_ENDPOINTS.ORDERS_DOWNLOADS,
        query,
      ),
    verify: (input: CheckoutVerificationInput) =>
      HttpClient.post<VerifiedCheckoutData>(
        API_ENDPOINTS.ORDERS_CHECKOUT_VERIFY,
        input,
      ),
    generateDownloadLink: (input: { digital_file_id: string }) =>
      HttpClient.post<string>(
        API_ENDPOINTS.GENERATE_DOWNLOADABLE_PRODUCT_LINK,
        input,
      ),
    getPaymentIntentOriginal: ({
      tracking_number,
    }: {
      tracking_number: string;
    }) =>
      HttpClient.get<PaymentIntentCollection>(API_ENDPOINTS.PAYMENT_INTENT, {
        tracking_number,
      }),
    getPaymentIntent: ({
      tracking_number,
      payment_gateway,
      recall_gateway,
    }: {
      tracking_number: string;
      payment_gateway?: string;
      recall_gateway?: boolean;
    }) =>
      HttpClient.get<PaymentIntentCollection>(API_ENDPOINTS.PAYMENT_INTENT, {
        tracking_number,
        payment_gateway,
        recall_gateway,
      }),
  };
  refundReason = {
    all: ({ type, ...params }: Partial<RefundQueryOptions>) =>
      HttpClient.get<RefundReasonPaginator>(API_ENDPOINTS.REFUNDS_REASONS, {
        searchJoin: 'and',
        ...params,
        ...(type && { search: HttpClient.formatSearchParams({ type }) }),
      }),
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
     * We translate the Pickbazar-shaped payload (`{ token, email }`) down to the
     * query param the backend actually consumes — `email` is ignored.
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
    }) => HttpClient.put<any>(API_ENDPOINTS.ME_PROFILE, input),

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
    deleteAddress: ({ id }: { id: string | number }) =>
      HttpClient.delete<void>(`${API_ENDPOINTS.ME_ADDRESSES}/${id}`),

    // ─── Kolshi has no server-side logout — caller drops the cookie. ─────
    logout: async () => Promise.resolve(true),

    // ─── Legacy / NYI surface kept as compiling stubs ────────────────────
    // Direct user-PUT (admin-only in Kolshi) — no shop UI should call this.
    update: (_user: UpdateUserInput) =>
      Promise.reject<User>(
        new Error('Direct user updates are not supported in Kolshi.'),
      ),
    // Email change has no dedicated endpoint; decision log marks B.7 as Hide.
    updateEmail: (_input: UpdateEmailUserInput) =>
      Promise.reject<EmailChangeResponse>(
        new Error('Email change is not available yet.'),
      ),
    // Password change route is hidden (A.6 Hide). Leaving the call alive but
    // pointed at `/me/password` so a future phase can surface the UI.
    changePassword: (input: ChangePasswordUserInput) =>
      HttpClient.put<PasswordChangeResponse>(
        API_ENDPOINTS.ME_PASSWORD,
        {
          currentPassword: (input as any).oldPassword ?? input.newPassword,
          newPassword: input.newPassword,
        },
      ),
    // Coming Soon — A.3 / A.4
    socialLogin: (_input: SocialLoginInputType) =>
      Promise.reject<AuthResponse>(
        new Error('Social login is coming soon.'),
      ),
    sendOtpCode: (_input: SendOtpCodeInputType) =>
      Promise.reject<OTPResponse>(new Error('OTP login is coming soon.')),
    verifyOtpCode: (_input: VerifyOtpInputType) =>
      Promise.reject<OTPVerifyResponse>(
        new Error('OTP login is coming soon.'),
      ),
    OtpLogin: (_input: OtpLoginInputType) =>
      Promise.reject<AuthResponse>(new Error('OTP login is coming soon.')),
    // Marketing / misc — scheduled for Delete in S6
    subscribe: (_input: { email: string }) =>
      Promise.reject<any>(new Error('Newsletter signup is not available.')),
    contactUs: (_input: CreateContactUsInput) =>
      Promise.reject<any>(new Error('Contact form is not available.')),
  };
  wishlist = {
    all: (params: WishlistQueryOptions) =>
      HttpClient.get<WishlistPaginator>(API_ENDPOINTS.USERS_WISHLIST, {
        with: 'shop',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
    toggle: (input: { product_id: string; language?: string }) =>
      HttpClient.post<{ in_wishlist: boolean }>(
        API_ENDPOINTS.USERS_WISHLIST_TOGGLE,
        input,
      ),
    remove: (id: string) =>
      HttpClient.delete<Wishlist>(`${API_ENDPOINTS.WISHLIST}/${id}`),
    checkIsInWishlist: ({ product_id }: { product_id: string }) =>
      HttpClient.get<boolean>(
        `${API_ENDPOINTS.WISHLIST}/in_wishlist/${product_id}`,
      ),
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
    /**
     * Kolshi does not accept multipart uploads; clients post direct to
     * Cloudinary via `useCloudinaryUpload`. This shim stays so legacy
     * callers compile until they are rewired in later phases.
     */
    upload: (_input: File[]) =>
      Promise.reject<Attachment[]>(
        new Error(
          'Multipart uploads are not supported by Kolshi — use Cloudinary.',
        ),
      ),
  };
  cards = {
    all: (params?: any) =>
      HttpClient.get<Card[]>(API_ENDPOINTS.CARDS, { ...params }),
    remove: ({ id }: { id: string }) =>
      HttpClient.delete<any>(`${API_ENDPOINTS.CARDS}/${id}`),
    addPaymentMethod: (method_key: any) =>
      HttpClient.post<any>(API_ENDPOINTS.CARDS, method_key),
    makeDefaultPaymentMethod: (input: any) =>
      HttpClient.post<any>(API_ENDPOINTS.SET_DEFAULT_CARD, input),
  };

  faqs = {
    // all: (params?: any) =>
    //   HttpClient.get<FAQS[]>(API_ENDPOINTS.FAQS, { ...params }),
    all: ({ faq_type, issued_by, ...params }: Partial<FaqsQueryOptions>) =>
      HttpClient.get<FaqsPaginator>(API_ENDPOINTS.FAQS, {
        ...params,
        search: HttpClient.formatSearchParams({
          faq_type,
          issued_by,
        }),
      }),
    get: (id: string) => HttpClient.get<FAQS>(`${API_ENDPOINTS.FAQS}/${id}`),
  };

  termsAndConditions = {
    // all: (params?: any) =>
    //   HttpClient.get<FAQS[]>(API_ENDPOINTS.FAQS, { ...params }),
    all: ({
      type,
      issued_by,
      ...params
    }: Partial<TermsAndConditionsQueryOptions>) =>
      HttpClient.get<TermsAndConditionsPaginator>(
        API_ENDPOINTS.TERMS_AND_CONDITIONS,
        {
          searchJoin: 'and',
          ...params,
          search: HttpClient.formatSearchParams({
            type,
            issued_by,
          }),
        },
      ),
    get: (id: string) =>
      HttpClient.get<FAQS>(`${API_ENDPOINTS.TERMS_AND_CONDITIONS}/${id}`),
  };
  flashSale = {
    // all: (params?: any) =>
    //   HttpClient.get<FAQS[]>(API_ENDPOINTS.FAQS, { ...params }),
    all: ({ ...params }: Partial<FlashSaleQueryOptions>) =>
      HttpClient.get<FlashSalePaginator>(API_ENDPOINTS.FLASH_SALE, {
        ...params,
      }),
    get: ({ slug, language }: { slug: string; language?: string }) => {
      return HttpClient.get<FlashSale>(`${API_ENDPOINTS.FLASH_SALE}/${slug}`, {
        language,
        with: 'products',
      });
    },
    getProductsByFlashSale: ({
      slug,
      ...params
    }: FlashSaleProductsQueryOptions) => {
      return HttpClient.get<ProductPaginator>(
        API_ENDPOINTS.PRODUCTS_BY_FLASH_SALE,
        {
          searchJoin: 'and',
          slug,
          ...params,
        },
      );
    },
  };

  refundPolicies = {
    all: ({
      title,
      status,
      target,
      ...params
    }: Partial<RefundPolicyQueryOptions>) =>
      HttpClient.get<RefundPolicyPaginator>(API_ENDPOINTS.REFUND_POLICIES, {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({
          title,
          target,
          status,
        }),

        with: 'shop;refunds',
      }),
  };
  notifyLogs = {
    all: (params: Partial<NotifyLogsQueryOptions>) =>
      HttpClient.get<NotifyLogsPaginator>(API_ENDPOINTS.NOTIFY_LOGS, {
        ...params,
      }),

    get: ({ id, language }: { id: string; language?: string }) => {
      return HttpClient.get<NotifyLogs>(`${API_ENDPOINTS.NOTIFY_LOGS}/${id}`, {
        language,
      });
    },
    readNotifyLog: (input: { id: string }) =>
      HttpClient.post<NotifyLogs>(API_ENDPOINTS.READ_NOTIFY_LOG, input),
    readAllNotifyLogs: ({ ...params }: Partial<NotifyLogsQueryOptions>) => {
      return HttpClient.post<any>(API_ENDPOINTS.READ_ALL_NOTIFY_LOG, {
        ...params,
      });
    },
  };
  becomeSeller = {
    get: ({ language }: Pick<QueryOptions, 'language'>) => {
      return HttpClient.get<BecomeSeller>(API_ENDPOINTS.BECAME_SELLER, {
        language,
      });
    },
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

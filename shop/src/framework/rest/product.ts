import type {
  PopularProductQueryOptions,
  Product,
  ProductPaginator,
  ProductQueryOptions,
  QuestionPaginator,
  QuestionQueryOptions,
  BestSellingProductQueryOptions,
  GetParams,
  ProductImage,
  ProductVariation,
  ReviewSummary,
} from '@/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { formatProductsArgs } from '@/framework/utils/format-products-args';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

/**
 * Normalises a response that might be either a plain `Product[]`
 * (Kolshi's curated-list shape) or a `ProductPaginator` (the paginated
 * catalogue shape). Both flows reach the same UI, so the hooks coerce
 * shape here rather than forcing consumers to branch.
 */
function unwrapProductList(
  payload: Product[] | ProductPaginator | null | undefined,
): Product[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return (payload as ProductPaginator).data ?? [];
}

export function useProducts(options?: Partial<ProductQueryOptions>) {
  const { locale } = useRouter();

  const formattedOptions = {
    ...formatProductsArgs(options),
    language: locale,
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ProductPaginator, Error>(
    [API_ENDPOINTS.PRODUCTS, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.products.all(
        Object.assign({}, queryKey[1] as any, pageParam),
      ) as Promise<ProductPaginator>,
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    products: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
}

export const usePopularProducts = (
  options?: Partial<PopularProductQueryOptions>,
) => {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale,
  };

  const { data, isLoading, error } = useQuery<
    Product[] | ProductPaginator,
    Error
  >([API_ENDPOINTS.PRODUCTS_POPULAR, formattedOptions], ({ queryKey }) =>
    client.products.popular(queryKey[1] as PopularProductQueryOptions),
  );

  return {
    products: unwrapProductList(data),
    isLoading,
    error,
  };
};

export const useBestSellingProducts = (
  options?: Partial<BestSellingProductQueryOptions>,
) => {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale,
  };

  const { data, isLoading, error } = useQuery<
    Product[] | ProductPaginator,
    Error
  >([API_ENDPOINTS.PRODUCTS_BEST_SELLING, formattedOptions], ({ queryKey }) =>
    client.products.bestSelling(
      queryKey[1] as BestSellingProductQueryOptions,
    ),
  );

  return {
    products: unwrapProductList(data),
    isLoading,
    error,
  };
};

export const useNewArrivalProducts = (
  options?: Partial<ProductQueryOptions>,
) => {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale,
  };

  const { data, isLoading, error } = useQuery<
    Product[] | ProductPaginator,
    Error
  >([API_ENDPOINTS.PRODUCTS_NEW_ARRIVALS, formattedOptions], ({ queryKey }) =>
    client.products.newArrivals(queryKey[1] as ProductQueryOptions),
  );

  return {
    products: unwrapProductList(data),
    isLoading,
    error,
  };
};

export function useProduct({ slug }: { slug: string }) {
  const { locale: language } = useRouter();

  const { data, isLoading, error } = useQuery<Product, Error>(
    [API_ENDPOINTS.PRODUCTS, { slug, language }],
    () => client.products.get({ slug, language }),
  );
  return {
    product: data,
    isLoading,
    error,
  };
}

/**
 * `GET /products/{id}/images` — Kolshi returns the gallery separately
 * from the product document so the PDP can paginate/stream the heavy
 * media list. The query is disabled until `id` is truthy to avoid a
 * spurious request on the first render before the slug resolves.
 */
export function useProductImages(id?: string | number | null) {
  const { data, isLoading, error } = useQuery<ProductImage[], Error>(
    [API_ENDPOINTS.PRODUCTS_IMAGES, id],
    () => client.products.images(id as string | number),
    { enabled: Boolean(id) },
  );
  return {
    images: data ?? [],
    isLoading,
    error,
  };
}

/**
 * `GET /products/{id}/variations?enabledOnly=true`. Disabled variations
 * must not appear on the shop front, so `enabledOnly` defaults to
 * `true`. Admin flows can opt-out by passing `false`.
 */
export function useProductVariations(
  id?: string | number | null,
  enabledOnly = true,
) {
  const { data, isLoading, error } = useQuery<ProductVariation[], Error>(
    [API_ENDPOINTS.PRODUCTS_VARIATIONS, id, { enabledOnly }],
    () => client.products.variations(id as string | number, enabledOnly),
    { enabled: Boolean(id) },
  );
  return {
    variations: data ?? [],
    isLoading,
    error,
  };
}

/**
 * `GET /reviews/products/{id}/summary`. Kolshi returns average,
 * total, and per-bucket breakdown — enough to render the histogram on
 * the PDP without pulling the full review list.
 */
export function useProductReviewSummary(id?: string | number | null) {
  const { data, isLoading, error } = useQuery<ReviewSummary, Error>(
    [API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY, id],
    () => client.products.reviewSummary(id as string | number),
    { enabled: Boolean(id) },
  );
  return {
    summary: data,
    isLoading,
    error,
  };
}

/** `GET /products/{id}/related`. Empty array when Kolshi has no match. */
export function useRelatedProducts(id?: string | number | null, limit = 12) {
  const { data, isLoading, error } = useQuery<Product[], Error>(
    [API_ENDPOINTS.PRODUCTS_RELATED, id, { limit }],
    () => client.products.related(id as string | number, { limit }),
    { enabled: Boolean(id) },
  );
  return {
    products: data ?? [],
    isLoading,
    error,
  };
}

/** `GET /products/{id}/frequently-bought-together`. */
export function useFrequentlyBoughtTogether(
  id?: string | number | null,
  limit = 6,
) {
  const { data, isLoading, error } = useQuery<Product[], Error>(
    [API_ENDPOINTS.PRODUCTS_FBT, id, { limit }],
    () =>
      client.products.frequentlyBoughtTogether(id as string | number, {
        limit,
      }),
    { enabled: Boolean(id) },
  );
  return {
    products: data ?? [],
    isLoading,
    error,
  };
}

/** `GET /products/recently-viewed` — signed-in users only. */
export function useRecentlyViewedProducts(limit = 12) {
  const { data, isLoading, error } = useQuery<Product[], Error>(
    [API_ENDPOINTS.PRODUCTS_RECENTLY_VIEWED, { limit }],
    () => client.products.recentlyViewed({ limit }),
  );
  return {
    products: data ?? [],
    isLoading,
    error,
  };
}

/**
 * `POST /products/{id}/track-view` — fire-and-forget on PDP mount.
 * Errors are swallowed intentionally: this is a best-effort analytics
 * signal and must never surface as a toast or break the render.
 */
export function useTrackProductView() {
  return useMutation((id: string | number) =>
    client.products.trackView(id).catch(() => undefined),
  );
}

/** `DELETE /products/recently-viewed`. */
export function useClearRecentlyViewed() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  return useMutation(() => client.products.clearRecentlyViewed(), {
    onSuccess: () => {
      toast.success(`${t('text-recently-viewed-cleared')}`);
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS_RECENTLY_VIEWED);
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────
 * Legacy / Coming-Soon hooks kept as compiling shims. S6 removes these
 * alongside their consumers (questions / feedback / abuse reporting).
 * ──────────────────────────────────────────────────────────────────── */

export function useQuestions(options?: Partial<QuestionQueryOptions>) {
  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useQuery<QuestionPaginator, Error>(
    [API_ENDPOINTS.PRODUCTS_QUESTIONS, options],
    ({ queryKey }) =>
      client.products.questions(
        Object.assign({}, queryKey[1] as QuestionQueryOptions),
      ),
    {
      keepPreviousData: true,
      enabled: false,
    },
  );
  return {
    questions: response?.data ?? [],
    paginatorInfo: mapPaginatorData(response),
    isLoading,
    error,
    isFetching,
  };
}

export function useCreateFeedback() {
  const { t } = useTranslation('common');
  const { mutate: createFeedback, isLoading } = useMutation(
    client.products.createFeedback,
    {
      onError: () => {
        toast.info(`${t('text-feature-coming-soon')}`);
      },
    },
  );
  return {
    createFeedback,
    isLoading,
  };
}

export function useCreateAbuseReport() {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const { mutate: createAbuseReport, isLoading } = useMutation(
    client.products.createAbuseReport,
    {
      onError: () => {
        toast.info(`${t('text-feature-coming-soon')}`);
      },
      onSettled: () => {
        closeModal();
      },
    },
  );
  return {
    createAbuseReport,
    isLoading,
  };
}

export function useCreateQuestion() {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const { mutate: createQuestion, isLoading } = useMutation(
    client.products.createQuestion,
    {
      onError: () => {
        toast.info(`${t('text-feature-coming-soon')}`);
      },
      onSettled: () => {
        closeModal();
      },
    },
  );
  return {
    createQuestion,
    isLoading,
  };
}

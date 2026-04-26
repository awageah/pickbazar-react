import type { Category, CategoryPaginator, CategoryQueryOptions } from '@/types';
import { useInfiniteQuery, useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { useRouter } from 'next/router';

export function useCategories(options?: Partial<CategoryQueryOptions>) {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
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
  } = useInfiniteQuery<CategoryPaginator, Error>(
    [API_ENDPOINTS.CATEGORIES, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.categories.all(
        Object.assign({}, queryKey[1] as any, pageParam),
      ) as Promise<CategoryPaginator>,
    {
      // Raw Kolshi response (via HttpClient.get) uses `page`/`lastPage`.
      getNextPageParam: ({ page: currentPage, lastPage: totalPages }: any) =>
        totalPages > currentPage ? { page: currentPage + 1 } : undefined,
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    categories: data?.pages?.flatMap((page) => page.data) ?? [],
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

/**
 * `GET /categories/tree` — full nested hierarchy for mega-menus and
 * sidebars. Cached on the query key `(endpoint, language)` so switching
 * the Accept-Language header refetches automatically.
 */
export function useCategoryTree() {
  const { locale } = useRouter();
  const { data, isLoading, error } = useQuery<Category[], Error>(
    [API_ENDPOINTS.CATEGORIES_TREE, { language: locale }],
    () => client.categories.tree({ language: locale }),
  );
  return {
    tree: data ?? [],
    isLoading,
    error,
  };
}

/** `GET /categories/roots` — top-level only, cheaper than the full tree. */
export function useCategoryRoots() {
  const { locale } = useRouter();
  const { data, isLoading, error } = useQuery<Category[], Error>(
    [API_ENDPOINTS.CATEGORIES_ROOTS, { language: locale }],
    () => client.categories.roots({ language: locale }),
  );
  return {
    roots: data ?? [],
    isLoading,
    error,
  };
}

/** `GET /categories/slug/{slug}`. */
export function useCategoryBySlug(slug?: string | null) {
  const { locale } = useRouter();
  const { data, isLoading, error } = useQuery<Category, Error>(
    [API_ENDPOINTS.CATEGORIES, 'slug', slug, { language: locale }],
    () => client.categories.bySlug(slug as string, { language: locale }),
    { enabled: Boolean(slug) },
  );
  return {
    category: data,
    isLoading,
    error,
  };
}

/** `GET /categories/{id}/children`. */
export function useCategoryChildren(id?: string | number | null) {
  const { locale } = useRouter();
  const { data, isLoading, error } = useQuery<Category[], Error>(
    [API_ENDPOINTS.CATEGORIES, id, 'children', { language: locale }],
    () =>
      client.categories.children(id as string | number, {
        language: locale,
      }),
    { enabled: Boolean(id) },
  );
  return {
    children: data ?? [],
    isLoading,
    error,
  };
}

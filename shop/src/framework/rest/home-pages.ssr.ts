import type {
  CategoryQueryOptions,
  HomePageProps,
  PopularProductQueryOptions,
  SettingsQueryOptions,
  BestSellingProductQueryOptions,
} from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import invariant from 'tiny-invariant';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  CATEGORIES_PER_PAGE,
  PRODUCTS_PER_PAGE,
} from './client/variables';

type ParsedQueryParams = {
  pages: string[];
};

/**
 * Kolshi Q.1 — the Pickbazar template drove the homepage from a
 * `/types` catalogue that picked the layout, banners, and curated
 * shelves per vertical. Kolshi has no `/types` concept, so SSR now
 * falls back to a single "default" page rendered with the classic
 * layout. We still emit per-locale paths for the root so the router
 * pre-renders Arabic and English.
 */
export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({
  locales,
}) => {
  invariant(locales, 'locales is not defined');
  return {
    paths: locales.map((locale) => ({ params: { pages: [] }, locale })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<
  HomePageProps,
  ParsedQueryParams
> = async ({ locale }) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) =>
      client.settings.all(queryKey[1] as SettingsQueryOptions),
  );

  // Types are now synthetic (decision log E.5). Prefetch the stub so
  // `useType` resolves synchronously on first render.
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPES, { limit: 100, language: locale }],
    () => client.types.all({ limit: 100 }),
  );

  const productVariables: Record<string, unknown> = {
    limit: PRODUCTS_PER_PAGE,
  };

  await queryClient.prefetchInfiniteQuery(
    [
      API_ENDPOINTS.PRODUCTS,
      { limit: PRODUCTS_PER_PAGE, language: locale },
    ],
    ({ queryKey }) => client.products.all(queryKey[1] as any),
  );

  const popularProductVariables: Partial<PopularProductQueryOptions> = {
    limit: 10,
    language: locale,
  };

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.PRODUCTS_POPULAR, popularProductVariables],
    ({ queryKey }) =>
      client.products.popular(queryKey[1] as PopularProductQueryOptions),
  );

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.PRODUCTS_BEST_SELLING, popularProductVariables],
    ({ queryKey }) =>
      client.products.bestSelling(
        queryKey[1] as BestSellingProductQueryOptions,
      ),
  );

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.PRODUCTS_NEW_ARRIVALS, popularProductVariables],
    ({ queryKey }) =>
      client.products.newArrivals(queryKey[1] as PopularProductQueryOptions),
  );

  // Category tree — preferred over the paginated `all` query because it
  // gives us the full hierarchy in one round-trip for the sidebar /
  // mega-menu. The paginated variant is still seeded so
  // `useCategories()` stays warm.
  const categoryVariables: Partial<CategoryQueryOptions> = {
    limit: CATEGORIES_PER_PAGE,
    language: locale,
    parent: 'null',
  };

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.CATEGORIES_TREE, { language: locale }],
    () => client.categories.tree({ language: locale }),
  );

  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.CATEGORIES, categoryVariables],
    ({ queryKey }) =>
      client.categories.all(queryKey[1] as CategoryQueryOptions),
  );

  return {
    props: {
      variables: {
        popularProducts: popularProductVariables,
        products: productVariables,
        categories: categoryVariables,
        bestSellingProducts: popularProductVariables,
        layoutSettings: {
          isHome: true,
          layoutType: 'classic',
          productCard: 'helium',
        },
        types: {
          type: 'kolshi',
        },
      },
      layout: 'classic',
      ...(await serverSideTranslations(locale!, ['common', 'banner'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 120,
  };
};

import type { Product } from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import invariant from 'tiny-invariant';
import client from './client';
import { dehydrate } from 'react-query/hydration';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { QueryClient } from 'react-query';
import { SettingsQueryOptions } from '@/types';

type ParsedQueryParams = {
  slug: string;
};

/**
 * Seeds the SSG path list from the first page of Kolshi products so
 * popular PDPs ship with HTML intact. New slugs fall through `fallback:
 * "blocking"` — revalidated every 60 s.
 */
export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({
  locales,
}) => {
  invariant(locales, 'locales is not defined');
  try {
    const response = await client.products.all({ limit: 100 });
    const list: any[] = Array.isArray(response)
      ? response
      : (response as any)?.data ?? [];
    const paths = list.flatMap((product) =>
      locales?.map((locale) => ({
        params: { slug: String(product.slug) },
        locale,
      })),
    );
    return {
      paths,
      fallback: 'blocking',
    };
  } catch {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};
type PageProps = {
  product: Product;
};
export const getStaticProps: GetStaticProps<
  PageProps,
  ParsedQueryParams
> = async ({ params, locale }) => {
  const { slug } = params!;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions),
  );

  try {
    const product = await client.products.get({ slug, language: locale });

    // Best-effort side prefetches — Kolshi exposes images, variations,
    // and review summary on separate endpoints so the PDP can continue
    // rendering even when one of these fails. Each settled promise is
    // silently ignored; the component-side hooks will simply refetch.
    if (product?.id) {
      await Promise.allSettled([
        queryClient.prefetchQuery(
          [API_ENDPOINTS.PRODUCTS_IMAGES, product.id],
          () => client.products.images(product.id),
        ),
        queryClient.prefetchQuery(
          [
            API_ENDPOINTS.PRODUCTS_VARIATIONS,
            product.id,
            { enabledOnly: true },
          ],
          () => client.products.variations(product.id, true),
        ),
        queryClient.prefetchQuery(
          [API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY, product.id],
          () => client.products.reviewSummary(product.id),
        ),
        queryClient.prefetchQuery(
          [API_ENDPOINTS.PRODUCTS_RELATED, product.id, { limit: 12 }],
          () => client.products.related(product.id, { limit: 12 }),
        ),
      ]);
    }

    return {
      props: {
        product,
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

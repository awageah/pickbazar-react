import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from '@/framework/client';
import { SettingsQueryOptions } from '@/types';
import { API_ENDPOINTS } from './client/api-endpoints';

/**
 * Hydrates `useSettings()` for the post-checkout / order-received /
 * order-detail routes. `/types` is not fetched (removed in S3 — Kolshi
 * doesn't expose the endpoint) and orders are deliberately fetched
 * client-side because every /orders route is auth-gated.
 */
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions),
  );

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

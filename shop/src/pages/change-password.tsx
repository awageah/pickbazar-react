import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import Seo from '@/components/seo/seo';

export { getStaticProps } from '@/framework/general.ssr';

/**
 * `A.6 Hide` — Kolshi exposes `PUT /me/password` but the shop does not surface
 * a change-password screen in the S2 scope. The route is kept so deep links
 * don't 404; it silently forwards users to their profile.
 */
const ChangePasswordPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(Routes.profile);
  }, [router]);

  return <Seo noindex={true} nofollow={true} />;
};

ChangePasswordPage.authenticationRequired = true;

export default ChangePasswordPage;

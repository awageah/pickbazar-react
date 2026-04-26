import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useLayout from '@/lib/hooks/use-layout';
import Header from './header';
import HeaderMinimal from './header-minimal';
import Footer from '../icons/check-icon';
import dynamic from 'next/dynamic';
import { useUser, useResendVerificationEmail } from '@/framework/rest/user';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Routes } from '@/config/routes';

const MobileNavigation = dynamic(() => import('./mobile-navigation'), {
  ssr: false,
});

/**
 * Banner shown when the signed-in user has not yet verified their email.
 * Renders nothing for guests or already-verified users.
 */
function EmailVerificationBanner() {
  const { t } = useTranslation('common');
  const { me, emailVerified, isAuthorized } = useUser();
  const { mutate: resend, isLoading } = useResendVerificationEmail();

  if (!isAuthorized || !me || emailVerified !== false) return null;

  return (
    <div className="flex items-center justify-between border-b border-yellow-200 bg-yellow-50 px-4 py-2">
      <p className="text-sm text-yellow-800">
        {t('text-verify-email-banner', {
          defaultValue: 'Please verify your email address to access all features.',
        })}
      </p>
      <button
        disabled={isLoading}
        onClick={() => resend({ email: me.email })}
        className="ml-4 text-sm text-yellow-800 underline disabled:opacity-50"
      >
        {t('text-resend-verification', { defaultValue: 'Resend email' })}
      </button>
    </div>
  );
}

/**
 * Listens for `?auth=expired` (added by the axios 401 interceptor) and
 * automatically opens the login modal, then removes the query param.
 *
 * This decouples the axios layer (no React access) from the modal system.
 */
function AuthExpiredHandler() {
  const router = useRouter();
  const { openModal } = useModalAction();

  useEffect(() => {
    if (router.query.auth === 'expired') {
      openModal('LOGIN_VIEW');
      router.replace(Routes.home, undefined, { shallow: true });
    }
  }, [router.query.auth]);

  return null;
}

/**
 * Kolshi S6 — `NoticeHighlightedBar` (store-notice highlighted banner) is
 * removed alongside the rest of the per-shop notices surface (decision
 * log L.5 Delete). Kolshi has no `/store-notices` endpoint, so the
 * banner would never render; dropping the component also removes the
 * dependency on `framework/rest/store-notices.ts`.
 */
export default function SiteLayout({ children }: React.PropsWithChildren<{}>) {
  const { layout } = useLayout();
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150">
      <AuthExpiredHandler />
      {['minimal', 'compact'].includes(layout) ? (
        <HeaderMinimal layout={layout} />
      ) : (
        <Header layout={layout} />
      )}
      <EmailVerificationBanner />
      {children}
      {['compact'].includes(layout) && <Footer />}
      <MobileNavigation />
    </div>
  );
}
export const getLayout = (page: React.ReactElement) => (
  <SiteLayout>{page}</SiteLayout>
);

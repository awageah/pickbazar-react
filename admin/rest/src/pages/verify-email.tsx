import Button from '@/components/ui/button';
import {
  useResendVerificationEmail,
  useLogoutMutation,
  useMeQuery,
} from '@/data/user';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import AuthPageLayout from '@/components/layouts/auth-layout';
import { useTranslation } from 'next-i18next';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
  },
});

/**
 * Verify-email gate.
 *
 * Email verification status is sourced from `GET /me` (not from the
 * `emailVerified` cookie that the old template wrote — that cookie has been
 * removed in A2).  `useMeQuery` already handles the redirect back to
 * `/verify-email` when `email_verified === false`, so this page only needs to
 * handle the "now verified" case and offer the resend action.
 */
export default function VerifyEmailPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: me } = useMeQuery();

  const { mutate: resendEmail, isLoading: isResending } =
    useResendVerificationEmail();
  const { mutate: logout, isLoading: isLoggingOut } = useLogoutMutation();

  // If the user has already verified their email (e.g. they land here after
  // clicking the email link), bounce them to the dashboard.
  if (me?.email_verified) {
    router.replace(Routes.dashboard);
    return null;
  }

  return (
    <AuthPageLayout>
      <h3 className="mt-4 mb-2 text-center text-base font-semibold text-red-500">
        {t('common:email-not-verified')}
      </h3>
      <p className="mb-6 text-center text-sm text-gray-500">
        {t('common:text-verify-email-description')}
      </p>
      <div className="w-full space-y-3">
        <Button
          onClick={() => resendEmail()}
          disabled={isResending}
          loading={isResending}
          className="w-full"
        >
          {t('common:text-resend-verification-email')}
        </Button>
        <Button
          type="button"
          disabled={isLoggingOut}
          loading={isLoggingOut}
          variant="outline"
          className="w-full"
          onClick={() => logout()}
        >
          {t('common:authorized-nav-item-logout')}
        </Button>
      </div>
    </AuthPageLayout>
  );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  useLogout,
  useResendVerificationEmail,
  useUser,
  useVerifyEmail,
} from '@/framework/user';
import Button from '@/components/ui/button';
import Card from '@/components/ui/cards/card';
import Alert from '@/components/ui/alert';
import Logo from '@/components/ui/logo';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';

export { getStaticProps } from '@/framework/general.ssr';

/**
 * This page handles two flows:
 *
 *  1. **Deep link from the verification email** — `/verify-email?token=<uuid>`.
 *     The token is consumed via `GET /api/v1/auth/verify-email?token=`; the
 *     page shows a success or failure state and offers navigation back home.
 *
 *  2. **Blocked session** — a signed-in but unverified user is bounced here by
 *     `PrivateRoute`. They can trigger a resend or sign out.
 */
const VerifyEmail = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { me, isAuthorized, emailVerified } = useUser();
  const { mutate: logout, isLoading: isLogoutLoader } = useLogout();
  const {
    mutate: verifyEmailToken,
    isLoading: isVerifyingToken,
    isSuccess: tokenVerified,
    serverError: tokenError,
  } = useVerifyEmail();
  const { mutate: resendVerification, isLoading: isResending } =
    useResendVerificationEmail();

  const token =
    typeof router.query.token === 'string' ? router.query.token : undefined;
  const isTokenMode = Boolean(token);

  useEffect(() => {
    if (token) {
      verifyEmailToken({ token });
    }
    // Trigger exactly once per token value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // If the backend already says we're verified, forward to /profile.
  useEffect(() => {
    if (isAuthorized && emailVerified === true && !isTokenMode) {
      router.replace(Routes.profile);
    }
  }, [isAuthorized, emailVerified, isTokenMode, router]);

  function handleLogout() {
    logout();
    router.push(Routes.home);
  }

  function handleResend() {
    const email = me?.email;
    if (!email) return;
    resendVerification({ email });
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[#F4F6F7] py-5 px-4 md:py-8">
      <div className="max-w-[36rem]">
        <Card className="text-center !shadow-900 md:px-[4.375rem] md:py-[2.875rem]">
          <Logo />

          {isTokenMode ? (
            <>
              <h2 className="mb-5 mt-2 text-2xl font-semibold">
                {tokenVerified
                  ? t('text-email-verified')
                  : tokenError
                    ? t('text-email-verification-failed')
                    : t('text-verifying-email')}
              </h2>
              <p className="mb-10 text-lg text-[#969FAF]">
                {tokenVerified
                  ? t('text-email-verified-description')
                  : tokenError
                    ? t(tokenError)
                    : t('text-verifying-email-description')}
              </p>
              {tokenError ? (
                <Alert
                  variant="error"
                  message={t(tokenError)}
                  className="mb-6"
                />
              ) : null}
              <div className="space-y-3">
                {tokenVerified ? (
                  <Button
                    onClick={() => router.push(Routes.home)}
                    className="!h-13 w-full hover:bg-accent-hover"
                  >
                    {t('text-continue-shopping')}
                  </Button>
                ) : tokenError ? (
                  <Button
                    onClick={handleResend}
                    disabled={!me?.email || isResending}
                    loading={isResending}
                    className="!h-13 w-full hover:bg-accent-hover"
                  >
                    {t('resend-verification-button-text')}
                  </Button>
                ) : (
                  <Button
                    loading
                    disabled
                    className="!h-13 w-full hover:bg-accent-hover"
                  >
                    {t('text-verifying-email')}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-5 mt-2 text-2xl font-semibold">
                {t('common:email-not-verified')}
              </h2>
              <p className="mb-16 text-lg text-[#969FAF]">
                {t('email-not-description')}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={!me?.email || isResending || !!isLogoutLoader}
                  loading={isResending}
                  className="!h-13 w-full hover:bg-accent-hover"
                >
                  {t('resend-verification-button-text')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="!h-13 w-full"
                  onClick={handleLogout}
                  disabled={!!isVerifyingToken || isLogoutLoader || isResending}
                  loading={isLogoutLoader}
                >
                  {t('auth-menu-logout')}
                </Button>
              </div>
            </>
          )}
          <div className="mt-4">
            <Link
              href={Routes.home}
              className="inline-flex items-center text-bolder underline hover:text-body-dark hover:no-underline focus:outline-none sm:text-base"
            >
              {t('404-back-home')}
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

// The deep-link flow must be reachable to logged-out users.
VerifyEmail.authenticationRequired = false;
export default VerifyEmail;

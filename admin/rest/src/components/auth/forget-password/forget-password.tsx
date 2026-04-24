import { useState } from 'react';
import Alert from '@/components/ui/alert';
import {
  useForgetPasswordMutation,
  useVerifyForgetPasswordTokenMutation,
  useResetPasswordMutation,
} from '@/data/user';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { normalizeApiError } from '@/utils/error-handler';

const EnterEmailView = dynamic(() => import('./enter-email-view'));
const EnterTokenView = dynamic(() => import('./enter-token-view'));
const EnterNewPasswordView = dynamic(() => import('./enter-new-password-view'));

/**
 * Three-step forgot-password flow adapted for Kolshi:
 *
 * Step 1 — Email: POST /auth/forgot-password { email }
 *           Success: advance to step 2.
 *
 * Step 2 — Token: POST /auth/verify-reset-token { token }
 *           Kolshi does NOT require the email in this request.
 *           Success: advance to step 3, keeping the token in local state.
 *
 * Step 3 — New password: POST /auth/reset-password { token, newPassword }
 *           Success: redirect to /login.
 */
const ForgotPassword = () => {
  const { t } = useTranslation();
  const { mutate: forgetPassword, isLoading } = useForgetPasswordMutation();
  const { mutate: verifyToken, isLoading: verifying } =
    useVerifyForgetPasswordTokenMutation();
  const { mutate: resetPassword, isLoading: resetting } =
    useResetPasswordMutation();

  const [errorMsg, setErrorMsg] = useState<string | null | undefined>('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');

  function handleEmailSubmit({ email }: { email: string }) {
    forgetPassword(
      { email },
      {
        onSuccess: (data) => {
          if (data?.success) {
            setVerifiedEmail(email);
          } else {
            setErrorMsg(t('form:error-something-wrong'));
          }
        },
        onError: (err) => {
          const normalized = normalizeApiError(err);
          setErrorMsg(normalized?.message ?? t('form:error-something-wrong'));
        },
      },
    );
  }

  function handleTokenSubmit({ token }: { token: string }) {
    // Kolshi verify-reset-token: only { token } required — email not sent.
    verifyToken(
      { token },
      {
        onSuccess: (data) => {
          if (data?.success) {
            setVerifiedToken(token);
          } else {
            setErrorMsg(t('form:error-invalid-token'));
          }
        },
        onError: (err) => {
          const normalized = normalizeApiError(err);
          setErrorMsg(normalized?.message ?? t('form:error-invalid-token'));
        },
      },
    );
  }

  function handleResetPassword({ password }: { password: string }) {
    // Kolshi reset-password: { token, newPassword }
    resetPassword(
      { token: verifiedToken, newPassword: password },
      {
        onSuccess: (data) => {
          if (data?.success) {
            Router.push(Routes.login);
          } else {
            setErrorMsg(t('form:error-something-wrong'));
          }
        },
        onError: (err) => {
          const normalized = normalizeApiError(err);
          setErrorMsg(normalized?.message ?? t('form:error-something-wrong'));
        },
      },
    );
  }

  return (
    <>
      {errorMsg && (
        <Alert
          variant="error"
          message={errorMsg}
          className="mb-6"
          closeable={true}
          onClose={() => setErrorMsg('')}
        />
      )}
      {!verifiedEmail && (
        <EnterEmailView loading={isLoading} onSubmit={handleEmailSubmit} />
      )}
      {verifiedEmail && !verifiedToken && (
        <EnterTokenView loading={verifying} onSubmit={handleTokenSubmit} />
      )}
      {verifiedEmail && verifiedToken && (
        <EnterNewPasswordView
          loading={resetting}
          onSubmit={handleResetPassword}
        />
      )}
    </>
  );
};

export default ForgotPassword;

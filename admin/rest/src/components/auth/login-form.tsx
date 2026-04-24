import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import Form from '@/components/ui/forms/form';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import Router from 'next/router';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';
import { getErrorCode } from '@/utils/error-handler';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup
    .string()
    .min(8, 'form:error-password-too-short')
    .required('form:error-password-required'),
});

const LoginForm = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: login, isLoading } = useLogin();

  function onSubmit({ email, password }: LoginInput) {
    login(
      { email, password },
      {
        onSuccess: (data) => {
          if (data?.token) {
            if (hasAccess(allowedRoles, data?.permissions)) {
              setAuthCredentials(
                data.token,
                data.permissions,
                data.role,
                data.expires_in,
              );
              // Redirect unverified users to the verify-email page;
              // the dashboard's getServerSideProps will also guard this.
              if (data.email_verified === false) {
                Router.push(Routes.verifyEmail);
                return;
              }
              Router.push(Routes.dashboard);
            } else {
              // Authenticated but not an admin role (e.g. customer).
              setErrorMessage('form:error-enough-permission');
            }
          } else {
            setErrorMessage('form:error-credential-wrong');
          }
        },
        onError: (err) => {
          const code = getErrorCode(err);
          if (code === 'EMAIL_NOT_VERIFIED') {
            Router.push(Routes.verifyEmail);
            return;
          }
          if (code === 'ACCOUNT_BLOCKED' || code === 'ACCOUNT_SUSPENDED') {
            setErrorMessage('form:error-account-blocked');
            return;
          }
          setErrorMessage('form:error-credential-wrong');
        },
      },
    );
  }

  return (
    <>
      <Form<LoginInput>
        validationSchema={loginFormSchema}
        onSubmit={onSubmit}
      >
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('form:input-label-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-4"
              error={t(errors?.email?.message!)}
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              className="mb-4"
              forgotPageLink={Routes.forgotPassword}
            />
            <Button className="w-full" loading={isLoading} disabled={isLoading}>
              {t('form:button-label-login')}
            </Button>
          </>
        )}
      </Form>

      {errorMessage ? (
        <Alert
          message={t(errorMessage)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
    </>
  );
};

export default LoginForm;

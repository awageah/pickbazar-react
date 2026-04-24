import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Logo from '@/components/ui/logo';
import Alert from '@/components/ui/alert';
import Input from '@/components/ui/forms/input';
import PasswordInput from '@/components/ui/forms/password-input';
import Button from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons/google';
import { MobileIcon } from '@/components/icons/mobile-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { useLogin, useResendVerificationEmail } from '@/framework/user';
import type { LoginUserInput } from '@/types';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('error-email-format')
    .required('error-email-required'),
  password: yup.string().required('error-password-required'),
});

function LoginForm() {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const {
    mutate: login,
    isLoading,
    serverError,
    setServerError,
    errorCode,
    setErrorCode,
    unverifiedEmail,
  } = useLogin();
  const { mutate: resendVerification, isLoading: isResending } =
    useResendVerificationEmail();

  const isEmailUnverified = errorCode === 'EMAIL_NOT_VERIFIED';
  const isAccountBlocked = errorCode === 'ACCOUNT_BLOCKED';

  function onSubmit({ email, password }: LoginUserInput) {
    login({ email, password });
  }

  function handleResend() {
    if (!unverifiedEmail) return;
    resendVerification({ email: unverifiedEmail });
  }

  function handleComingSoon() {
    setServerError('text-feature-coming-soon');
  }

  return (
    <>
      {isEmailUnverified && unverifiedEmail ? (
        <Alert
          variant="info"
          message={t('text-email-not-verified-banner', { email: unverifiedEmail })}
          className="mb-4"
          closeable
          onClose={() => {
            setErrorCode(null);
            setServerError(null);
          }}
        >
          <Button
            variant="outline"
            loading={isResending}
            disabled={isResending}
            onClick={handleResend}
            className="!h-9 mt-3 w-full text-xs sm:w-auto"
          >
            {t('text-resend-verification-email')}
          </Button>
        </Alert>
      ) : (
        <Alert
          variant="error"
          message={serverError ? t(serverError) : undefined}
          className="mb-6"
          closeable
          onClose={() => {
            setServerError(null);
            setErrorCode(null);
          }}
        />
      )}
      {isAccountBlocked && (
        <Alert
          variant="error"
          message={t('text-account-blocked')}
          className="mb-4"
        />
      )}
      <Form<LoginUserInput>
        onSubmit={onSubmit}
        validationSchema={loginFormSchema}
      >
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('text-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-5"
              error={t(errors.email?.message!)}
            />
            <PasswordInput
              label={t('text-password')}
              {...register('password')}
              error={t(errors.password?.message!)}
              variant="outline"
              className="mb-5"
              forgotPageRouteOnClick={() => openModal('FORGOT_VIEW')}
            />
            <div className="mt-8">
              <Button
                className="w-full h-11 sm:h-12"
                loading={isLoading}
                disabled={isLoading}
              >
                {t('text-login')}
              </Button>
            </div>
          </>
        )}
      </Form>
      {/* Coming-Soon social/OTP placeholders — rendered disabled so the UI
          stays recognisable while A.3/A.4 are dormant. */}
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-11 sm:mb-8">
        <hr className="w-full" />
        <span className="absolute -top-2.5 bg-light px-2 ltr:left-2/4 ltr:-ml-4 rtl:right-2/4 rtl:-mr-4">
          {t('text-or')}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <Button
          className="!bg-social-google !text-light opacity-60 hover:!bg-social-google"
          disabled
          title={t('text-feature-coming-soon')}
          onClick={handleComingSoon}
        >
          <GoogleIcon className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
          {t('text-login-google')} · {t('text-coming-soon')}
        </Button>

        <Button
          className="h-11 w-full !bg-gray-500 !text-light opacity-60 sm:h-12"
          disabled
          title={t('text-feature-coming-soon')}
          onClick={handleComingSoon}
        >
          <MobileIcon className="h-5 text-light ltr:mr-2 rtl:ml-2" />
          {t('text-login-mobile')} · {t('text-coming-soon')}
        </Button>

        {/* Kolshi F.4: guest-checkout dropped — sign-in is required. */}
      </div>
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-11 sm:mb-8">
        <hr className="w-full" />
      </div>
      <div className="text-sm text-center text-body sm:text-base">
        {t('text-no-account')}{' '}
        <button
          onClick={() => openModal('REGISTER')}
          className="font-semibold underline transition-colors duration-200 text-accent hover:text-accent-hover hover:no-underline focus:text-accent-hover focus:no-underline focus:outline-0 ltr:ml-1 rtl:mr-1"
        >
          {t('text-register')}
        </button>
      </div>
    </>
  );
}

export default function LoginView() {
  const { t } = useTranslation('common');
  return (
    <div className="flex h-full min-h-screen w-screen flex-col justify-center bg-light py-6 px-5 sm:p-8 md:h-auto md:min-h-0 md:max-w-[480px] md:rounded-xl">
      <div className="flex justify-center">
        <Logo />
      </div>
      <p className="mt-4 mb-8 text-sm text-center text-body sm:mt-5 sm:mb-10 md:text-base">
        {t('login-helper')}
      </p>
      <LoginForm />
    </div>
  );
}

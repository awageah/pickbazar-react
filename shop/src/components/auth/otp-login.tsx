import { useTranslation } from 'next-i18next';
import Logo from '@/components/ui/logo';
import Button from '@/components/ui/button';
import { useModalAction } from '@/components/ui/modal/modal.context';

/**
 * `A.4 Coming Soon` — OTP / phone-number login is not wired to the Kolshi
 * backend yet. We keep the file so the modal registry doesn't break and
 * render a friendly placeholder instead of the full phone-entry flow.
 */
export default function OtpLoginView() {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();

  return (
    <div className="flex h-screen w-screen flex-col justify-center bg-light px-5 py-6 sm:p-8 md:h-auto md:max-w-md md:rounded-xl">
      <div className="flex justify-center">
        <Logo />
      </div>
      <p className="mt-4 mb-7 text-center text-sm leading-relaxed text-body sm:mt-5 sm:mb-10 md:text-base">
        {t('otp-login-helper')}
      </p>

      <div className="flex flex-col items-center space-y-3 rounded border border-dashed border-border-base bg-gray-50 p-6 text-center">
        <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {t('text-coming-soon')}
        </span>
        <p className="text-sm text-sub-heading">
          {t('text-otp-login-coming-soon')}
        </p>
      </div>

      <div className="relative mt-9 mb-7 flex flex-col items-center justify-center text-sm text-heading sm:mt-11 sm:mb-8">
        <hr className="w-full" />
        <span className="absolute -top-2.5 bg-light px-2 ltr:left-2/4 ltr:-ml-4 rtl:right-2/4 rtl:-mr-4">
          {t('text-or')}
        </span>
      </div>
      <Button
        variant="outline"
        onClick={() => openModal('LOGIN_VIEW')}
        className="mx-auto"
      >
        {t('text-back-to')} {t('text-login')}
      </Button>
    </div>
  );
}

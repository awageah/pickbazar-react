import { useState } from 'react';
import Input from '@/components/ui/forms/input';
import Button from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { couponAtom } from '@/store/checkout';
import { useAtom } from 'jotai';
import classNames from 'classnames';
import {
  useBestMatchCoupon,
  useVerifyCoupon,
} from '@/framework/settings';

type FormTypes = {
  code: string;
};

/**
 * Coupon entry for the checkout summary.
 *
 * Wires `POST /coupons/validate` via `useVerifyCoupon`. Adds a
 * "use best offer" shortcut backed by `POST /coupons/best-match`
 * (Kolshi F.5). The legacy `items` / `sub_total` payload is dropped —
 * Kolshi only needs `{ code, sub_total }` to resolve a coupon.
 */
const Coupon = ({ theme, subtotal }: { theme?: 'dark'; subtotal: number }) => {
  const { t } = useTranslation('common');
  const [hasCoupon, setHasCoupon] = useState(false);
  const [coupon] = useAtom(couponAtom);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormTypes>();
  const {
    mutate: verifyCoupon,
    isLoading: loading,
    formError,
  } = useVerifyCoupon();
  const { mutate: fetchBestMatch, isLoading: bestMatchLoading } =
    useBestMatchCoupon();

  if (!hasCoupon && !coupon) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="text-xs font-bold transition duration-200 text-body hover:text-accent"
          onClick={() => setHasCoupon(true)}
        >
          {t('text-have-coupon')}
        </button>
        <button
          type="button"
          disabled={bestMatchLoading || subtotal <= 0}
          onClick={() => fetchBestMatch({ sub_total: subtotal })}
          className="text-xs font-semibold text-accent underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bestMatchLoading
            ? t('text-checking')
            : t('text-use-best-coupon')}
        </button>
      </div>
    );
  }

  function onSubmit(input: FormTypes) {
    verifyCoupon({ code: input.code, sub_total: subtotal });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col w-full sm:flex-row"
    >
      <Input
        {...register('code', { required: 'text-coupon-required' })}
        placeholder={t('text-enter-coupon')}
        variant="outline"
        className="flex-1 mb-4 sm:mb-0 ltr:sm:mr-4 rtl:sm:ml-4"
        dimension="small"
        error={t(formError?.code ?? errors.code?.message ?? '')}
      />
      <Button
        loading={loading}
        disabled={loading}
        size="small"
        className={classNames('w-full sm:w-40 lg:w-auto', {
          'bg-gray-800 transition-colors hover:bg-gray-900': theme === 'dark',
        })}
      >
        {t('text-apply')}
      </Button>
    </form>
  );
};

export default Coupon;

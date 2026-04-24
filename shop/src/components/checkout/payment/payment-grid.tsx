import { RadioGroup } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import CashOnDelivery from '@/components/checkout/payment/cash-on-delivery';
import { useAtom } from 'jotai';
import { paymentGatewayAtom } from '@/store/checkout';
import cn from 'classnames';
import { PaymentGateway } from '@/types';
import { StripeIcon } from '@/components/icons/payment-gateways/stripe';

interface PaymentMethodOption {
  name: string;
  value: PaymentGateway;
  icon: React.ReactNode | string;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Kolshi H.1 / H.2 — Payment gateway selector.
 *
 * The backend currently exposes only `CASH_ON_DELIVERY`; a disabled
 * Stripe tile is rendered with a tooltip until the webhook phase
 * ships. Razorpay / PayPal / Paystack / Mollie etc. tiles were
 * removed entirely (H.2 Delete) to avoid half-working checkout
 * paths.
 */
const PaymentGrid: React.FC<{ className?: string; theme?: 'bw' }> = ({
  className,
  theme,
}) => {
  const { t } = useTranslation('common');
  const [gateway, setGateway] = useAtom(paymentGatewayAtom);

  const methods: PaymentMethodOption[] = [
    {
      name: t('text-cash-on-delivery'),
      value: PaymentGateway.COD,
      icon: '',
    },
    {
      name: 'Stripe',
      value: PaymentGateway.STRIPE,
      icon: <StripeIcon />,
      disabled: true,
      tooltip: t('text-stripe-coming-soon') as string,
    },
  ];

  useEffect(() => {
    if (!gateway) setGateway(PaymentGateway.COD);
    else {
      const selected = methods.find((m) => m.value === gateway);
      if (selected?.disabled) setGateway(PaymentGateway.COD);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <RadioGroup value={gateway} onChange={setGateway}>
        <RadioGroup.Label className="mb-5 block text-base font-semibold text-heading">
          {t('text-choose-payment')}
        </RadioGroup.Label>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {methods.map((method) => (
            <RadioGroup.Option
              key={method.value}
              value={method.value}
              disabled={method.disabled}
              title={method.tooltip}
            >
              {({ checked }) => (
                <div
                  className={cn(
                    'relative flex h-full w-full items-center justify-center rounded border border-gray-200 bg-light p-3 text-center',
                    method.disabled
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer',
                    checked && !method.disabled && '!border-accent shadow-600',
                    theme === 'bw' && checked && '!border-accent shadow-600',
                  )}
                >
                  {method.icon ? (
                    <>{method.icon}</>
                  ) : (
                    <span className="text-xs font-semibold text-heading">
                      {method.name}
                    </span>
                  )}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      <div>
        <CashOnDelivery />
      </div>
    </div>
  );
};

export default PaymentGrid;

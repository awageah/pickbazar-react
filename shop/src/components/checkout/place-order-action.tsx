import { useState } from 'react';
import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import { usePlaceOrderMutation } from '@/framework/order';
import ValidationError from '@/components/ui/validation-error';
import Button from '@/components/ui/button';
import { useCart } from '@/store/quick-cart/cart.context';
import { checkoutAtom } from '@/store/checkout';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
import { REVIEW_POPUP_MODAL_KEY } from '@/lib/constants';
import type { KolshiCreateOrderInput } from '@/types';

/**
 * Kolshi F.3 / G.4 — `POST /orders` returns `List<OrderDTO>` (one per
 * shop in the cart). The hook takes care of the redirect:
 *   - single order → `/orders/{tracking}` (legacy behaviour).
 *   - multi-order  → `/orders/order-received?ids=…` (new fan-out page).
 *
 * Wallet / payment-intent / verified-response logic is removed: Kolshi
 * has no wallet (N.1) and payment intent is deferred to the H.1 webhook
 * phase. The only gate here is "contact + gateway + addresses are set".
 */
export const PlaceOrderAction: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = (props) => {
  const { t } = useTranslation('common');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { placeOrder, isLoading } = usePlaceOrderMutation();
  const { items, isEmpty: isCartEmpty, total } = useCart();

  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      customer_contact,
      customer_name,
      payment_gateway,
      note,
    },
  ] = useAtom(checkoutAtom);

  function handlePlaceOrder() {
    if (isCartEmpty) {
      setErrorMessage('error-cart-empty');
      return;
    }
    if (!customer_contact) {
      setErrorMessage('error-contact-required');
      return;
    }
    if (!payment_gateway) {
      setErrorMessage('error-gateway-required');
      return;
    }

    const shippingText =
      typeof shipping_address?.address === 'string'
        ? shipping_address.address
        : shipping_address?.address
        ? JSON.stringify(shipping_address.address)
        : undefined;
    const billingText =
      typeof billing_address?.address === 'string'
        ? billing_address.address
        : billing_address?.address
        ? JSON.stringify(billing_address.address)
        : undefined;

    const payload: KolshiCreateOrderInput = {
      payment_gateway: payment_gateway as unknown as string,
      customer_contact,
      customer_name: customer_name ?? undefined,
      note,
      delivery_time:
        typeof delivery_time === 'string'
          ? delivery_time
          : (delivery_time as any)?.title ?? '',
      shipping_address: shippingText,
      billing_address: billingText,
      coupon_code: coupon?.code,
    };

    setErrorMessage(null);
    placeOrder(payload as any);
    Cookies.remove(REVIEW_POPUP_MODAL_KEY);
  }

  const requiredFields = [
    customer_contact,
    payment_gateway,
    shipping_address,
    items,
  ];
  const isReady = requiredFields.every((v) => !isEmpty(v));

  return (
    <>
      <Button
        loading={isLoading}
        className={classNames('mt-5 w-full', props.className)}
        onClick={handlePlaceOrder}
        disabled={!isReady || isLoading || isCartEmpty}
        {...props}
      />
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={t(errorMessage)} />
        </div>
      )}
      {!isReady && !errorMessage && (
        <div className="mt-3">
          <ValidationError message={t('text-place-order-helper-text')} />
        </div>
      )}
    </>
  );
};

import Coupon from '@/components/checkout/coupon';
import usePrice from '@/lib/use-price';
import EmptyCartIcon from '@/components/icons/empty-cart';
import { CloseIcon } from '@/components/icons/close-icon';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import { useAtom } from 'jotai';
import { couponAtom, discountAtom } from '@/store/checkout';
import ItemCard from '@/components/checkout/item/item-card';
import { ItemInfoRow } from '@/components/checkout/item/item-info-row';
import PaymentGrid from '@/components/checkout/payment/payment-grid';
import { PlaceOrderAction } from '@/components/checkout/place-order-action';
import { useSettings } from '@/framework/settings';
import { CouponType } from '@/types';
import { calculateTotal } from '@/store/quick-cart/cart.utils';

interface Props {
  className?: string;
}

/**
 * Checkout right-panel summary.
 *
 * Kolshi F.3/F.6/N.1 — the "verified" response (tax/shipping pre-check)
 * and wallet integration are gone. Tax and delivery-fee cells stay as
 * placeholder rows so the component keeps its original layout, but the
 * totals are derived entirely from the cart subtotal and an applied
 * coupon. The backend calculates authoritative totals at order-creation
 * time and returns them in the `Order` response.
 */
const VerifiedItemList: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation('common');
  const { items, isEmpty: isEmptyCart } = useCart();
  const [coupon, setCoupon] = useAtom(couponAtom);
  const [discount] = useAtom(discountAtom);
  const { settings } = useSettings();
  const freeShippingAmount = settings?.freeShippingAmount;
  const freeShipping = settings?.freeShipping;

  const base_amount = calculateTotal(items as any);
  const { price: sub_total } = usePrice({ amount: base_amount });

  let calculateDiscount = 0;
  switch (coupon?.type) {
    case CouponType.PERCENTAGE:
      calculateDiscount = (base_amount * Number(discount)) / 100;
      break;
    case CouponType.FREE_SHIPPING:
      calculateDiscount = 0;
      break;
    default:
      calculateDiscount = Number(discount) || 0;
  }

  const { price: discountPrice } = usePrice({
    amount: Number(calculateDiscount) || 0,
  });
  const freeShippings =
    freeShipping && Number(freeShippingAmount) <= base_amount;
  const totalPrice = Math.max(base_amount - calculateDiscount, 0);
  const { price: total } = usePrice({ amount: totalPrice });

  return (
    <div className={className}>
      <div className="flex flex-col pb-2 border-b border-border-200">
        {!isEmptyCart ? (
          items?.map((item) => (
            <ItemCard item={item} key={String(item.id)} />
          ))
        ) : (
          <EmptyCartIcon />
        )}
      </div>

      <div className="mt-4 space-y-2">
        <ItemInfoRow title={t('text-sub-total')} value={sub_total} />
        <ItemInfoRow
          title={t('text-tax')}
          value={t('text-calculated-checkout')}
        />
        <div className="flex justify-between">
          <p className="text-sm text-body">
            {t('text-shipping')}{' '}
            <span className="text-xs font-semibold text-accent">
              {freeShippings ? `(${t('text-free-shipping')})` : ''}
            </span>
          </p>
          <span className="text-sm text-body">
            {t('text-calculated-checkout')}
          </span>
        </div>
        {discount && coupon ? (
          <div className="flex justify-between">
            <p className="flex items-center gap-1 text-sm text-body ltr:mr-2 rtl:ml-2">
              {t('text-discount')}{' '}
              <span className="-mt-px text-xs font-semibold text-accent">
                {coupon?.type === CouponType.FREE_SHIPPING
                  ? `(${t('text-free-shipping')})`
                  : ''}
              </span>
            </p>
            <span className="flex items-center text-xs font-semibold text-red-500 ltr:mr-auto rtl:ml-auto">
              ({coupon?.code})
              <button onClick={() => setCoupon(null)} aria-label="remove-coupon">
                <CloseIcon className="w-3 h-3 ltr:ml-2 rtl:mr-2 mt-0.5" />
              </button>
            </span>
            <span className="flex items-center gap-1 text-sm text-body">
              {calculateDiscount > 0 ? <span className="-mt-0.5">-</span> : null}{' '}
              {discountPrice}
            </span>
          </div>
        ) : (
          <div className="mt-5 !mb-4 flex justify-between">
            <Coupon subtotal={base_amount} />
          </div>
        )}
        <div className="flex justify-between pt-3 border-t-4 border-double border-border-200">
          <p className="text-base font-semibold text-heading">
            {t('text-total')}
          </p>
          <span className="text-base font-semibold text-heading">{total}</span>
        </div>
      </div>
      <PaymentGrid className="p-5 mt-10 border border-gray-200 bg-light" />
      <PlaceOrderAction>{t('text-place-order')}</PlaceOrderAction>
    </div>
  );
};

export default VerifiedItemList;

import usePrice from '@/lib/use-price';
import { formatAddress } from '@/lib/format-address';
import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { Eye } from '@/components/icons/eye-icon';
import { OrderItems } from './order-items';
import Badge from '@/components/ui/badge';
import type { Order } from '@/types';
import { KolshiOrderStatus, OrderStatus, PaymentStatus } from '@/types';
import OrderViewHeader from './order-view-header';
import OrderStatusProgressBox from '@/components/orders/order-status-progress-box';
import { useSettings } from '@/framework/settings';
import { useCancelOrder } from '@/framework/order';
import { useState } from 'react';

interface Props {
  order: Order;
  loadingStatus?: boolean;
}

/**
 * Kolshi H.1 — A customer can cancel an order any time before it leaves
 * the facility (i.e. before `AT_LOCAL_FACILITY`). Treat unknown / legacy
 * Pickbazar statuses as cancellable because the backend is still the
 * authority and will reject invalid transitions.
 */
function canCancel(status?: string | null) {
  if (!status) return false;
  const normalized = String(status).toUpperCase();
  const blocked = new Set<string>([
    KolshiOrderStatus.AT_LOCAL_FACILITY,
    KolshiOrderStatus.OUT_FOR_DELIVERY,
    KolshiOrderStatus.COMPLETED,
    KolshiOrderStatus.CANCELLED,
  ]);
  return !blocked.has(normalized);
}

const OrderDetails = ({ order, loadingStatus }: Props) => {
  const { t } = useTranslation('common');
  const { settings } = useSettings();
  const {
    id,
    products,
    shipping_address,
    billing_address,
    tracking_number,
  }: any = order ?? {};

  const { price: amount } = usePrice({ amount: order?.amount });
  const { price: discount } = usePrice({ amount: order?.discount ?? 0 });
  const { price: total } = usePrice({ amount: order?.total });
  const { price: delivery_fee } = usePrice({
    amount: order?.delivery_fee ?? 0,
  });
  const { price: sales_tax } = usePrice({ amount: order?.sales_tax });

  const cancelMutation = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const cancellable = canCancel(order?.order_status);
  const isCancelled =
    String(order?.order_status ?? '').toUpperCase() ===
    KolshiOrderStatus.CANCELLED;

  function handleCancelClick() {
    if (!cancellable || cancelMutation.isLoading) return;
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    cancelMutation.mutate({ id });
    setConfirmOpen(false);
  }

  return (
    <div className="flex w-full flex-col border border-border-200 bg-white lg:w-2/3">
      <div className="flex flex-col items-center p-5 md:flex-row md:justify-between">
        <h2 className="mb-2 flex text-sm font-semibold text-heading md:text-lg">
          {t('text-order-details')} <span className="px-2">-</span>{' '}
          {tracking_number}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {isCancelled && (
            <Badge
              text={t('text-cancelled') as string}
              color="bg-red-500"
              className="!mr-0"
            />
          )}
          {cancellable && (
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={cancelMutation.isLoading}
              className="flex items-center text-sm font-semibold text-red-500 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelMutation.isLoading
                ? t('text-cancelling')
                : confirmOpen
                  ? t('text-confirm-cancel')
                  : t('text-cancel-order')}
            </button>
          )}
          <Link
            href={`${Routes.trackOrder}?tracking_number=${encodeURIComponent(
              tracking_number ?? '',
            )}`}
            className="flex items-center text-sm font-semibold text-accent no-underline transition duration-200 hover:text-accent-hover focus:text-accent-hover"
          >
            <Eye width={20} className="ltr:mr-2 rtl:ml-2" />
            {t('text-track-order')}
          </Link>
        </div>
      </div>
      <div className="relative mx-5 mb-6 overflow-hidden rounded">
        <OrderViewHeader
          order={order}
          wrapperClassName="px-7 py-4"
          buttonSize="small"
          loading={loadingStatus}
        />
      </div>

      <div className="flex flex-col border-b border-border-200 sm:flex-row">
        <div className="flex w-full flex-col border-b border-border-200 px-5 py-4 sm:border-b-0 ltr:sm:border-r rtl:sm:border-l md:w-3/5">
          <div className="mb-4">
            <span className="mb-2 block text-sm font-bold text-heading">
              {t('text-shipping-address')}
            </span>

            <span className="text-sm text-body">
              {formatAddress(shipping_address)}
            </span>
          </div>

          <div>
            <span className="mb-2 block text-sm font-bold text-heading">
              {t('text-billing-address')}
            </span>

            <span className="text-sm text-body">
              {formatAddress(billing_address)}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col px-5 py-4 md:w-2/5">
          <div className="mb-3 flex justify-between">
            <span className="text-sm text-body">{t('text-sub-total')}</span>
            <span className="text-sm text-heading">{amount}</span>
          </div>

          <div className="mb-3 flex justify-between">
            <span className="text-sm text-body">{t('text-discount')}</span>
            <span className="text-sm text-heading">{discount}</span>
          </div>

          <div className="mb-3 flex justify-between">
            <span className="text-sm text-body">{t('text-delivery-fee')}</span>
            <span className="text-sm text-heading">{delivery_fee}</span>
          </div>
          <div className="mb-3 flex justify-between">
            <span className="text-sm text-body">{t('text-tax')}</span>
            <span className="text-sm text-heading">{sales_tax}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-bold text-heading">
              {t('text-total')}
            </span>
            <span className="text-sm font-bold text-heading">{total}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex w-full items-center justify-center px-6">
          <OrderStatusProgressBox
            orderStatus={order?.order_status as OrderStatus}
            paymentStatus={order?.payment_status as PaymentStatus}
          />
        </div>
        <OrderItems
          settings={settings}
          products={products}
          orderId={id}
          orderStatus={order?.order_status}
          refund={false}
        />
      </div>
    </div>
  );
};

export default OrderDetails;

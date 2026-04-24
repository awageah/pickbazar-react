import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Link from '@/components/ui/link';
import usePrice from '@/lib/use-price';
import { formatAddress } from '@/lib/format-address';
import { formatString } from '@/lib/format-string';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import { OrderItems } from '@/components/orders/order-items';
import { useAtom } from 'jotai';
import { clearCheckoutAtom } from '@/store/checkout';
import isEmpty from 'lodash/isEmpty';
import {
  KolshiOrderStatus,
  OrderStatus,
  PaymentStatus,
} from '@/types';
import { HomeIconNew } from '@/components/icons/home-icon-new';
import OrderViewHeader from './order-view-header';
import OrderStatusProgressBox from '@/components/orders/order-status-progress-box';
import { useCancelOrder } from '@/framework/order';
import Badge from '@/components/ui/badge';

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

function isCompleted(status?: string | null) {
  return (
    String(status ?? '').toUpperCase() === KolshiOrderStatus.COMPLETED
  );
}

function OrderView({ order, settings, loadingStatus }: any) {
  const { t } = useTranslation('common');
  const { resetCart } = useCart();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);
  const cancelMutation = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    resetCart();
    // @ts-ignore
    resetCheckout();
  }, [resetCart, resetCheckout]);

  const { price: total } = usePrice({ amount: order?.paid_total ?? order?.total ?? 0 });
  const { price: sub_total } = usePrice({ amount: order?.amount ?? 0 });
  const { price: shipping_charge } = usePrice({
    amount: order?.delivery_fee ?? 0,
  });
  const { price: tax } = usePrice({ amount: order?.sales_tax ?? 0 });
  const { price: discount } = usePrice({ amount: order?.discount ?? 0 });

  const cancellable = canCancel(order?.order_status);
  const completed = isCompleted(order?.order_status);
  const isCancelled =
    String(order?.order_status ?? '').toUpperCase() ===
    KolshiOrderStatus.CANCELLED;

  function handleCancelClick() {
    if (!cancellable || cancelMutation.isLoading) return;
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    cancelMutation.mutate({ id: order?.id });
    setConfirmOpen(false);
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto w-full max-w-screen-lg">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={Routes.home}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
          >
            <HomeIconNew />
            {t('text-back-to-home')}
          </Link>

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
                className="inline-flex h-10 items-center rounded border border-red-500 px-4 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelMutation.isLoading
                  ? t('text-cancelling')
                  : confirmOpen
                    ? t('text-confirm-cancel')
                    : t('text-cancel-order')}
              </button>
            )}
            {completed && (
              <Link
                href={Routes.order(order?.tracking_number ?? '')}
                className="inline-flex h-10 items-center rounded border border-accent px-4 text-sm font-semibold text-accent transition hover:bg-accent hover:text-light"
              >
                {t('text-leave-a-review')}
              </Link>
            )}
            <Link
              href={`${Routes.trackOrder}?tracking_number=${encodeURIComponent(
                order?.tracking_number ?? '',
              )}`}
              className="inline-flex h-10 items-center rounded border border-border-200 px-4 text-sm font-semibold text-heading transition hover:border-accent hover:text-accent"
            >
              {t('text-track-order')}
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded border shadow-sm">
          <OrderViewHeader
            order={order}
            buttonSize="small"
            loading={loadingStatus}
          />
          <div className="bg-light p-6 sm:p-8 lg:p-12">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 md:mb-12 lg:grid-cols-4">
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-order-number')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.tracking_number}
                </p>
              </div>
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-date')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.created_at
                    ? dayjs(order?.created_at).format('MMMM D, YYYY')
                    : dayjs(new Date()).format('MMMM D, YYYY')}
                </p>
              </div>
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-total')}
                </h3>
                <p className="text-sm text-body-dark">{total}</p>
              </div>
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-payment-method')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.payment_gateway ?? 'N/A'}
                </p>
              </div>
            </div>

            <div className="mb-8 flex w-full items-center justify-center md:mb-12">
              <OrderStatusProgressBox
                orderStatus={order?.order_status as OrderStatus}
                paymentStatus={order?.payment_status as PaymentStatus}
              />
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="mb-12 w-full lg:mb-0 lg:w-1/2 ltr:lg:pr-3 rtl:lg:pl-3">
                <h2 className="mb-6 text-xl font-bold text-heading">
                  {t('text-total-amount')}
                </h2>
                <div>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-sub-total')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {sub_total}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-shipping-charge')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {shipping_charge}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-tax')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {tax}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-discount')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {discount}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-total')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                      {total}
                    </span>
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-1/2 ltr:lg:pl-3 rtl:lg:pr-3">
                <h2 className="mb-6 text-xl font-bold text-heading">
                  {t('text-order-details')}
                </h2>
                <div>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-4/12 text-sm font-semibold text-heading">
                      {t('text-name')} :
                    </strong>
                    <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                      {order?.customer_name}
                    </span>
                  </p>

                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-4/12 text-sm font-semibold text-heading">
                      {t('text-total-item')} :
                    </strong>
                    <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                      {formatString(order?.products?.length, t('text-item'))}
                    </span>
                  </p>
                  {!isEmpty(order?.delivery_time) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-deliver-time')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                        {order?.delivery_time}
                      </span>
                    </p>
                  )}
                  {!isEmpty(order?.shipping_address) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-shipping-address')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                        {formatAddress(order?.shipping_address!)}
                      </span>
                    </p>
                  )}
                  {!isEmpty(order?.billing_address) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-billing-address')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4">
                        {formatAddress(order?.billing_address!)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12">
              <OrderItems
                products={order?.products}
                orderId={order?.id}
                orderStatus={order?.order_status}
                refund={false}
                settings={settings}
              />
            </div>

            {order?.note ? (
              <>
                <h2 className="mt-12 mb-5 text-xl font-bold text-heading">
                  {t('common:text-purchase-note')}
                </h2>
                <div className="mb-12 flex items-start rounded border border-gray-700 bg-gray-100 p-4">
                  <p className="text-sm text-heading">{order?.note}</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  order: any;
  settings: any;
  loadingStatus?: boolean;
}

const Order: React.FC<Props> = ({ order, settings, loadingStatus }) => {
  return (
    <OrderView
      order={order}
      loadingStatus={loadingStatus}
      settings={settings}
    />
  );
};

export default Order;

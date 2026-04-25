/**
 * Shop-scoped order detail — reuses the shared admin order detail page.
 * Kolshi's GET /orders/{id} is already scoped server-side for store_owners,
 * so there is no need for a separate implementation here.
 */
import Card from '@/components/common/card';
import Layout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Button from '@/components/ui/button';
import OrderStatusProgressBox from '@/components/order/order-status-progress-box';
import OrderViewHeader from '@/components/order/order-view-header';
import { Table } from '@/components/ui/table';
import {
  useOrderQuery,
  useAdvanceOrderStatusMutation,
  useCancelOrderMutation,
  useOrderNotesQuery,
  useAddOrderNoteMutation,
  useDeleteOrderNoteMutation,
  useOrderHistoryQuery,
} from '@/data/order';
import { NoDataFound } from '@/components/icons/no-data-found';
import { siteSettings } from '@/settings/site.settings';
import { OrderStatus, PaymentStatus, KolshiOrderItem } from '@/types';
import { NEXT_STATUS, canCancel } from '@/utils/order-status';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';

function formatKolshiAddress(addr: any): string {
  if (!addr) return '—';
  const { street, city, state, country, zip } = addr;
  return [street, city, state, zip, country].filter(Boolean).join(', ');
}

export default function ShopOrderDetailsPage() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const orderId = query.orderId as string;

  const { order, isLoading: loading, error } = useOrderQuery({ id: orderId });
  const { notes, isLoading: loadingNotes } = useOrderNotesQuery(orderId);
  const { history, isLoading: loadingHistory } = useOrderHistoryQuery(orderId);

  const { mutate: advanceStatus, isLoading: advancing } = useAdvanceOrderStatusMutation();
  const { mutate: cancelOrder, isLoading: cancelling } = useCancelOrderMutation();
  const { mutate: addNote, isLoading: addingNote } = useAddOrderNoteMutation();
  const { mutate: deleteNote } = useDeleteOrderNoteMutation();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<{ note: string; customer_visible: boolean }>({
    defaultValues: { note: '', customer_visible: false },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!order) return null;

  const currentStatus = order.order_status as string;
  const nextStatus = NEXT_STATUS[currentStatus];
  const allowCancel = canCancel(currentStatus);

  const productColumns = [
    {
      dataIndex: 'product_image',
      key: 'image',
      width: 70,
      render: (image: string) => (
        <div className="relative h-[50px] w-[50px]">
          <Image
            src={image ?? siteSettings.product.placeholder}
            alt="product"
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-fill"
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string, item: KolshiOrderItem) => (
        <div>
          <span>{name}</span>
          <span className="mx-2">x</span>
          <span className="font-semibold text-heading">{item.quantity}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: function Render(subtotal: number) {
        const { price } = usePrice({ amount: subtotal });
        return <span>{price}</span>;
      },
    },
  ];

  const historyColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <span className="font-medium text-heading">{s.replace(/_/g, ' ')}</span>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (n: string) => n ?? '—',
    },
    {
      title: 'When',
      dataIndex: 'changed_at',
      key: 'changed_at',
      render: (d: string) => dayjs(d).format('DD MMM YYYY HH:mm'),
    },
  ];

  function onSubmitNote({ note, customer_visible }: { note: string; customer_visible: boolean }) {
    addNote({ orderId, note, customer_visible }, { onSuccess: () => reset() });
  }

  const { price: subtotalPrice } = usePrice({ amount: order.amount });
  const { price: totalPrice } = usePrice({ amount: order.total });
  const { price: discountPrice } = usePrice({ amount: order.discount ?? 0 });

  return (
    <>
      <Card className="relative overflow-hidden mb-8">
        <div className="mb-6 -mt-5 -ml-5 -mr-5 md:-mr-8 md:-ml-8 md:-mt-8">
          <OrderViewHeader order={order} wrapperClassName="px-8 py-4" />
        </div>

        <div className="flex flex-col items-center lg:flex-row mb-6">
          <h3 className="mb-4 w-full whitespace-nowrap text-center text-2xl font-semibold text-heading lg:mb-0 lg:w-1/3 lg:text-start">
            {t('form:input-label-order-id')} — {order.tracking_number}
          </h3>

          <div className="flex flex-wrap items-center gap-3 ms-auto">
            {nextStatus && (
              <Button
                onClick={() => advanceStatus({ id: order.id, newStatus: nextStatus })}
                loading={advancing}
                className="bg-accent"
              >
                Advance → {nextStatus.replace(/_/g, ' ')}
              </Button>
            )}
            {allowCancel && (
              <Button
                onClick={() => cancelOrder(order.id)}
                loading={cancelling}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="my-5 flex items-center justify-center lg:my-10">
          <OrderStatusProgressBox
            orderStatus={currentStatus as OrderStatus}
            paymentStatus={order.payment_status as PaymentStatus}
          />
        </div>

        <div className="mb-10">
          {order.products?.length ? (
            <Table
              //@ts-ignore
              columns={productColumns}
              data={order.products as any}
              rowKey="product_id"
              scroll={{ x: 300 }}
            />
          ) : (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
            </div>
          )}

          <div className="flex w-full flex-col space-y-2 border-t-4 border-double border-border-200 px-4 py-4 ms-auto sm:w-1/2 md:w-1/3">
            <div className="flex items-center justify-between text-sm text-body">
              <span>{t('common:order-sub-total')}</span>
              <span>{subtotalPrice}</span>
            </div>
            {(order.discount ?? 0) > 0 && (
              <div className="flex items-center justify-between text-sm text-body">
                <span>{t('text-discount')}</span>
                <span>-{discountPrice}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-semibold text-heading">
              <span>{t('text-total')}</span>
              <span>{totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-10">
          <div className="mb-10 w-full sm:mb-0 sm:w-1/2 sm:pe-8">
            <h3 className="mb-3 border-b border-border-200 pb-2 font-semibold text-heading">
              {t('common:billing-address')}
            </h3>
            <div className="flex flex-col space-y-1 text-sm text-body">
              <span>{order.customer_name}</span>
              <span>{formatKolshiAddress(order.billing_address)}</span>
              {order.customer_contact && <span>{order.customer_contact}</span>}
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:ps-8">
            <h3 className="mb-3 border-b border-border-200 pb-2 font-semibold text-heading text-start sm:text-end">
              {t('common:shipping-address')}
            </h3>
            <div className="flex flex-col items-end space-y-1 text-sm text-body text-end">
              <span>{order.customer_name}</span>
              <span>{formatKolshiAddress(order.shipping_address)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="mb-8">
        <h2 className="mb-5 text-xl font-bold text-heading">Order Notes</h2>
        <form onSubmit={handleSubmit(onSubmitNote)} className="mb-6">
          <textarea
            {...register('note', { required: true })}
            rows={2}
            placeholder="Add a staff note…"
            className="mb-2 w-full rounded border border-border-200 px-3 py-2 text-sm focus:outline-none"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-body">
              <input type="checkbox" {...register('customer_visible')} />
              Visible to customer
            </label>
            <Button type="submit" loading={addingNote} className="ms-auto">
              Add Note
            </Button>
          </div>
        </form>
        {loadingNotes ? (
          <Loader text={t('common:text-loading')} />
        ) : notes.length === 0 ? (
          <p className="text-sm text-body">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between rounded border border-border-200 bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm text-body">{n.note}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {dayjs(n.created_at).format('DD MMM YYYY HH:mm')}
                    {n.customer_visible && (
                      <span className="ml-2 rounded bg-blue-100 px-1 text-blue-600">
                        customer visible
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote({ orderId, noteId: n.id })}
                  className="ml-3 text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* History */}
      <Card>
        <h2 className="mb-5 text-xl font-bold text-heading">Status History</h2>
        {loadingHistory ? (
          <Loader text={t('common:text-loading')} />
        ) : (
          <Table
            //@ts-ignore
            columns={historyColumns}
            data={history}
            rowKey="id"
            scroll={{ x: 400 }}
          />
        )}
      </Card>
    </>
  );
}

ShopOrderDetailsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopOrderDetailsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});

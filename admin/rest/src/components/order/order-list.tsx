import Pagination from '@/components/ui/pagination';
import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import usePrice from '@/utils/use-price';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { Order, MappedPaginatorInfo } from '@/types';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useRouter } from 'next/router';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import Avatar from '../common/avatar';

type IProps = {
  orders: Order[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  /** Optional — kept for backward compat with list pages that pass it. */
  onSort?: (current: any) => void;
  /** Optional — kept for backward compat with list pages that pass it. */
  onOrder?: (current: string) => void;
};

const OrderList = ({
  orders,
  paginatorInfo,
  onPagination,
}: IProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const columns = [
    {
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: alignLeft,
      width: 200,
    },
    {
      title: t('table:table-item-customer'),
      dataIndex: 'customer_name',
      key: 'customer_name',
      align: alignLeft,
      width: 250,
      render: (customerName: string, record: Order) => (
        <div className="flex items-center">
          <Avatar name={customerName} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {customerName ?? t('common:text-guest')}
            <span className="text-[13px] font-normal text-gray-500/80">
              {record.customer_contact}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'products',
      key: 'products',
      align: 'center' as const,
      render: (products: any[]) => <span>{products?.length ?? 0}</span>,
    },
    {
      title: t('table:table-item-order-date'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-delivery-fee'),
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      align: 'center' as const,
      render: function Render(value: any) {
        const { price } = usePrice({ amount: value ?? 0 });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'total',
      key: 'total',
      align: 'center' as const,
      width: 120,
      render: function Render(value: any) {
        const { price } = usePrice({ amount: value });
        return <span className="whitespace-nowrap">{price}</span>;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'center' as const,
      render: (order_status: string) => (
        <Badge text={t(order_status)} color={StatusColor(order_status)} />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (id: string) => (
        <ActionButtons
          id={id}
          detailsUrl={`${router.asPath}/${id}`}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={orders}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderList;

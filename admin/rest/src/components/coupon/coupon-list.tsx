import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import usePrice from '@/utils/use-price';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'next-i18next';
import { Coupon, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useIsRTL } from '@/utils/locals';
import Badge from '../ui/badge/badge';
import { useRouter } from 'next/router';
import ActionButtons from '@/components/common/action-buttons';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

type IProps = {
  coupons: Coupon[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  /** Optional — kept for backward compat with list pages that still pass it. */
  onSort?: (current: any) => void;
  onOrder?: (current: string) => void;
};

const CouponList = ({ coupons, paginatorInfo, onPagination }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignLeft, alignRight } = useIsRTL();

  const columns = [
    {
      title: t('table:table-item-code'),
      dataIndex: 'code',
      key: 'code',
      align: alignLeft,
      render: (text: string) => (
        <span className="whitespace-nowrap font-semibold">{text}</span>
      ),
    },
    {
      title: t('form:input-label-type'),
      dataIndex: 'discount_type',
      key: 'discount_type',
      align: 'center' as const,
      render: (dt: string) => (
        <Badge
          text={dt}
          color={
            dt === 'PERCENTAGE'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-green-100 text-green-600'
          }
        />
      ),
    },
    {
      title: t('table:table-item-coupon-amount'),
      dataIndex: 'discount_value',
      key: 'discount_value',
      align: 'center' as const,
      render: function Render(value: number, record: Coupon) {
        const { price } = usePrice({ amount: value });
        if (record.discount_type === 'PERCENTAGE') {
          return <span>{value}%</span>;
        }
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-minimum-cart-amount'),
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      align: 'center' as const,
      render: function Render(v: number) {
        const { price } = usePrice({ amount: v ?? 0 });
        return <span>{v ? price : '—'}</span>;
      },
    },
    {
      title: 'Uses',
      dataIndex: 'times_used',
      key: 'times_used',
      align: 'center' as const,
      render: (used: number, record: Coupon) =>
        `${used ?? 0} / ${record.max_uses ?? '∞'}`,
    },
    {
      title: t('table:table-item-expired'),
      dataIndex: 'expires_at',
      key: 'expires_at',
      align: 'center' as const,
      render: (date: string) =>
        date ? (
          <span className="whitespace-nowrap">
            {dayjs().to(dayjs.utc(date).tz(dayjs.tz.guess()))}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center' as const,
      render: (active: boolean) => (
        <Badge
          text={active ? 'Active' : 'Inactive'}
          color={
            active
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 160,
      render: (id: string | number, record: Coupon) => (
        <ActionButtons
          id={String(id)}
          editUrl={`${Routes.coupon.list}/${record.code}/edit`}
          deleteModalView="DELETE_COUPON"
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
              <div className="pt-6 mb-1 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={coupons}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default CouponList;

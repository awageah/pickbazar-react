import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { MappedPaginatorInfo, Review } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { StarIcon } from '@/components/icons/star-icon';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useRouter } from 'next/router';
import Badge from '@/components/ui/badge/badge';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export type IProps = {
  reviews: Review[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort?: (current: any) => void;
  onOrder?: (current: string) => void;
};

const ReviewList = ({ reviews, paginatorInfo, onPagination }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const router = useRouter();

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: t('table:table-item-product'),
      dataIndex: 'productName',
      key: 'product',
      align: alignLeft,
      width: 200,
      render: (name: string) => (
        <span className="truncate whitespace-nowrap font-medium">{name ?? '—'}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      align: alignLeft,
      width: 160,
      render: (name: string) => <span className="text-sm">{name ?? '—'}</span>,
    },
    {
      title: t('table:table-item-ratings'),
      dataIndex: 'rating',
      key: 'rating',
      align: 'center' as const,
      width: 110,
      render: (rating: number) => (
        <div className="inline-flex shrink-0 items-center rounded-full border border-accent px-3 py-0.5 text-base text-accent">
          {rating}
          <StarIcon className="ms-1 h-3 w-3" />
        </div>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      align: alignLeft,
      render: (comment: string, record: Review) => (
        <div>
          <p className="text-sm line-clamp-2 text-body">{comment ?? '—'}</p>
          {record.isVerifiedPurchase && (
            <Badge
              text="Verified Purchase"
              color="bg-green-100 text-green-600"
              className="mt-1 text-xs"
            />
          )}
          {record.response && (
            <p className="mt-1 text-xs text-gray-400 italic">
              Has shop response
            </p>
          )}
        </div>
      ),
    },
    {
      title: t('table:table-item-date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: alignLeft,
      width: 130,
      render: (date: string) => (
        <span className="whitespace-nowrap text-sm">
          {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
        </span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 100,
      render: (id: string | number) => (
        <ActionButtons id={String(id)} deleteModalView="DELETE_REVIEW" />
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
          data={reviews}
          rowKey="id"
          scroll={{ x: 1000 }}
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

export default ReviewList;

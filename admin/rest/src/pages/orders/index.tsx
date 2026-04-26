import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import OrderList from '@/components/order/order-list';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useOrdersQuery } from '@/data/order';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'ORDER_PENDING' },
  { label: 'Processing', value: 'ORDER_PROCESSING' },
  { label: 'Out for Delivery', value: 'ORDER_OUT_FOR_DELIVERY' },
  { label: 'Completed', value: 'ORDER_COMPLETED' },
  { label: 'Cancelled', value: 'ORDER_CANCELLED' },
  { label: 'Failed', value: 'ORDER_FAILED' },
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { t } = useTranslation();

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  const { orders, loading, paginatorInfo, error } = useOrdersQuery({
    limit: 20,
    page,
    tracking_number: searchTerm,
    statuses: statusFilter ? [statusFilter] : undefined,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="md:w-1/4">
          <PageHeading title={t('form:input-label-orders')} />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-row items-center md:w-1/4">
          <Search
            onSearch={handleSearch}
            className="w-full"
            placeholderText={t('form:input-placeholder-search-tracking-number')}
          />
        </div>
      </Card>

      <OrderList
        orders={orders}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
      />
    </>
  );
}

Orders.authenticate = {
  permissions: adminOnly,
};
Orders.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

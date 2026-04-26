import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import WithdrawList from '@/components/withdraw/withdraw-list';
import { adminOnly } from '@/utils/auth-utils';
import {
  useWithdrawsQuery,
  usePendingWithdrawsQuery,
  useApproveWithdrawMutation,
  useRejectWithdrawMutation,
} from '@/data/withdraw';
import { useState } from 'react';
import PageHeading from '@/components/common/page-heading';

type StatusTab = 'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED';

const TAB_OPTIONS: { label: string; value: StatusTab }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'All', value: 'ALL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function WithdrawsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<StatusTab>('PENDING');

  const pendingQuery = usePendingWithdrawsQuery(
    { limit: 10, page },
    { enabled: statusTab === 'PENDING' },
  );

  const allQuery = useWithdrawsQuery(
    {
      limit: 10,
      page,
      status: statusTab === 'ALL' ? undefined : statusTab,
    } as any,
    { enabled: statusTab !== 'PENDING' },
  );

  const { withdraws, paginatorInfo, loading, error } =
    statusTab === 'PENDING' ? pendingQuery : allQuery;

  const { mutate: approveWithdraw } = useApproveWithdrawMutation();
  const { mutate: rejectWithdraw } = useRejectWithdrawMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    setPage(current);
  }

  function handleTabChange(tab: StatusTab) {
    setStatusTab(tab);
    setPage(1);
  }

  function handleApprove(id: string | number) {
    approveWithdraw({ id });
  }

  function handleReject(id: string | number, rejectionReason: string) {
    rejectWithdraw({ id, rejectionReason });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-withdraws')} />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1">
          {TAB_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusTab === value
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <WithdrawList
        withdraws={withdraws}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onApprove={statusTab === 'PENDING' ? handleApprove : undefined}
        onReject={statusTab === 'PENDING' ? handleReject : undefined}
      />
    </>
  );
}

WithdrawsPage.authenticate = { permissions: adminOnly };
WithdrawsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

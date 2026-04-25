import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import AdminLayout from '@/components/layouts/admin';
import {
  useWithdrawQuery,
  useApproveWithdrawMutation,
  useRejectWithdrawMutation,
} from '@/data/withdraw';
import Card from '@/components/common/card';
import Badge from '@/components/ui/badge/badge';
import usePrice from '@/utils/use-price';
import dayjs from 'dayjs';

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
};

const WithdrawDetail = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { withdrawId } = router.query;

  const { withdraw, error, isLoading: loading } = useWithdrawQuery({
    id: withdrawId as string,
  });
  const { mutate: approveWithdraw, isLoading: approving } = useApproveWithdrawMutation();
  const { mutate: rejectWithdraw, isLoading: rejecting } = useRejectWithdrawMutation();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const reasonError = rejectionReason.length > 0 && rejectionReason.length < 10;

  const { price: amount } = usePrice({ amount: withdraw?.amount ?? 0 });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!withdraw) return null;

  const isPending = (withdraw.status as string)?.toUpperCase() === 'PENDING';

  function handleApprove() {
    approveWithdraw({ id: withdrawId as string });
  }

  function handleReject() {
    if (rejectionReason.length < 10) return;
    rejectWithdraw(
      { id: withdrawId as string, rejectionReason },
      {
        onSuccess: () => {
          setShowRejectForm(false);
          setRejectionReason('');
        },
      },
    );
  }

  return (
    <>
      <h3 className="mb-6 w-full text-xl font-semibold text-heading">
        {t('common:text-withdrawal-info')}
      </h3>

      <Card className="mb-6">
        {/* ── Info grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              {t('common:text-amount')}
            </p>
            <p className="text-lg font-bold text-heading">{amount}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              {t('common:text-status')}
            </p>
            <Badge
              text={withdraw.status as string}
              color={statusColor[(withdraw.status as string)?.toUpperCase()] ?? 'bg-gray-100'}
            />
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              {t('common:text-payment-method')}
            </p>
            <p className="text-sm text-body">{withdraw.payment_method ?? '—'}</p>
          </div>
          {withdraw.created_at && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                {t('table:table-item-created-at')}
              </p>
              <p className="text-sm text-body">
                {dayjs(withdraw.created_at).format('DD MMM YYYY HH:mm')}
              </p>
            </div>
          )}
          {withdraw.details && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-gray-500">
                {t('common:text-details')}
              </p>
              <p className="text-sm text-body">{withdraw.details}</p>
            </div>
          )}
          {withdraw.note && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-gray-500">
                {t('common:text-note')}
              </p>
              <p className="text-sm text-body">{withdraw.note}</p>
            </div>
          )}
        </div>

        {/* ── Admin actions — only for PENDING withdrawals ── */}
        {isPending && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border-200 pt-4">
            <Button
              onClick={handleApprove}
              loading={approving}
              className="bg-accent"
            >
              {t('form:button-label-approve') ?? 'Approve'}
            </Button>
            <Button
              onClick={() => setShowRejectForm((v) => !v)}
              variant="outline"
              className="border-red-500 text-red-500"
            >
              {t('form:button-label-reject') ?? 'Reject'}
            </Button>
          </div>
        )}

        {/* ── Reject reason form ── */}
        {showRejectForm && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-red-700">
              Rejection Reason <span className="font-normal">(min. 10 characters)</span>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Bank account details do not match…"
              className="mb-2 w-full rounded border border-border-200 px-3 py-2 text-sm focus:outline-none"
            />
            {reasonError && (
              <p className="mb-2 text-xs text-red-500">
                Reason must be at least 10 characters.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                loading={rejecting}
                disabled={rejectionReason.length < 10}
                className="bg-red-500"
              >
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default WithdrawDetail;

WithdrawDetail.authenticate = { permissions: adminOnly };
WithdrawDetail.Layout = AdminLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['table', 'common', 'form'])),
  },
});

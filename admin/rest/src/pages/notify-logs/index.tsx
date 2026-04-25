/**
 * Admin Notifications — A8.
 *
 * Three tabs: Failed (J14), Dead-letter (J15), Stats (J16).
 * Failed notifications have a "Retry" button (J17).
 */
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import Button from '@/components/ui/button';
import PageHeading from '@/components/common/page-heading';
import Pagination from '@/components/ui/pagination';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  useAdminFailedNotificationsQuery,
  useAdminDeadLetterQuery,
  useAdminNotificationStatsQuery,
  useRetryNotificationMutation,
} from '@/data/notify-logs';
import { KolshiAdminNotification } from '@/types';
import { useState } from 'react';
import dayjs from 'dayjs';
import Badge from '@/components/ui/badge/badge';
import { NoDataFound } from '@/components/icons/no-data-found';
import cn from 'classnames';

// ── Tab IDs ───────────────────────────────────────────────────────────────────

type Tab = 'failed' | 'dead_letter' | 'stats';

// ── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({
  item,
  showRetry,
}: {
  item: KolshiAdminNotification;
  showRetry?: boolean;
}) {
  const { mutate: retry, isLoading: retrying } = useRetryNotificationMutation();

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border-200/60 p-4 hover:bg-gray-50/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-heading">{item.subject}</p>
          {item.body && (
            <p className="mt-0.5 line-clamp-2 text-sm text-body">{item.body}</p>
          )}
          {item.error_message && (
            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
              Error: {item.error_message}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge
            text={item.type.replace(/_/g, ' ')}
            color="bg-blue-100 text-blue-600"
            className="text-xs"
          />
          {showRetry && (
            <Button
              onClick={() => retry({ id: item.id })}
              loading={retrying}
              className="h-7 !px-3 text-xs"
            >
              ↺ Retry
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>#{item.id}</span>
        {item.retry_count != null && (
          <span>Retries: {item.retry_count}</span>
        )}
        <span className="ms-auto">
          {dayjs(item.created_at).format('DD MMM YYYY HH:mm')}
        </span>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-12">
      <NoDataFound className="w-36" />
      <p className="mt-4 text-base font-semibold text-heading">
        No {label} notifications
      </p>
    </div>
  );
}

// ── Stats panel ───────────────────────────────────────────────────────────────

function StatsPanel() {
  const { stats, loading, error } = useAdminNotificationStatsQuery();

  if (loading) return <Loader text="Loading stats…" />;
  if (error || !stats) return <ErrorMessage message="Stats unavailable" />;

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
      {(
        [
          { label: 'Sent', value: stats.sent, color: 'text-green-600' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Failed', value: stats.failed, color: 'text-red-500' },
          { label: 'Dead-letter', value: stats.dead_letter, color: 'text-red-800' },
        ] as const
      ).map(({ label, value, color }) => (
        <Card key={label} className="flex flex-col items-center py-6">
          <p className={`text-4xl font-bold ${color}`}>{value}</p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </Card>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotifyLogsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('failed');
  const [failedPage, setFailedPage] = useState(1);
  const [dlPage, setDlPage] = useState(1);

  const {
    notifications: failedNotifs,
    paginatorInfo: failedPaginator,
    loading: loadingFailed,
    error: errorFailed,
  } = useAdminFailedNotificationsQuery(
    { page: failedPage, limit: 20 },
    { enabled: activeTab === 'failed' },
  );

  const {
    notifications: dlNotifs,
    paginatorInfo: dlPaginator,
    loading: loadingDl,
    error: errorDl,
  } = useAdminDeadLetterQuery(
    { page: dlPage, limit: 20 },
    { enabled: activeTab === 'dead_letter' },
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'failed', label: 'Failed' },
    { id: 'dead_letter', label: 'Dead-letter' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <>
      {/* Header */}
      <Card className="mb-6 flex items-center">
        <PageHeading title={t('form:form-title-all-notifications')} />
      </Card>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-border-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-accent text-accent'
                : 'text-gray-500 hover:text-heading',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'failed' && (
        <>
          {loadingFailed ? (
            <Loader text={t('common:text-loading')} />
          ) : errorFailed ? (
            <ErrorMessage message={errorFailed.message} />
          ) : failedNotifs.length === 0 ? (
            <EmptyState label="failed" />
          ) : (
            <>
              <div className="space-y-3">
                {failedNotifs.map((n: KolshiAdminNotification) => (
                  <NotificationRow key={n.id} item={n} showRetry />
                ))}
              </div>
              {!!failedPaginator?.total && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    total={failedPaginator.total}
                    current={failedPaginator.currentPage}
                    pageSize={failedPaginator.perPage}
                    onChange={setFailedPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'dead_letter' && (
        <>
          {loadingDl ? (
            <Loader text={t('common:text-loading')} />
          ) : errorDl ? (
            <ErrorMessage message={errorDl.message} />
          ) : dlNotifs.length === 0 ? (
            <EmptyState label="dead-letter" />
          ) : (
            <>
              <div className="space-y-3">
                {dlNotifs.map((n: KolshiAdminNotification) => (
                  <NotificationRow key={n.id} item={n} showRetry={false} />
                ))}
              </div>
              {!!dlPaginator?.total && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    total={dlPaginator.total}
                    current={dlPaginator.currentPage}
                    pageSize={dlPaginator.perPage}
                    onChange={setDlPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'stats' && <StatsPanel />}
    </>
  );
}

NotifyLogsPage.authenticate = { permissions: adminOnly };
NotifyLogsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

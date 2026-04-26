/**
 * Super-admin dashboard — A4 + A8.
 *
 * KPIs derived from queue endpoints (pending shops, orders, users,
 * pending withdrawals). System health + notification stats added in A8.
 */
import dynamic from 'next/dynamic';
import RecentOrders from '@/components/order/recent-orders';
import WithdrawTable from '@/components/withdraw/withdraw-table';
import Loader from '@/components/ui/loader/loader';
import Link from '@/components/ui/link';
import StickerCard from '@/components/widgets/sticker-card';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import { BasketIcon } from '@/components/icons/summary/basket';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import {
  usePendingShopsCountQuery,
  useOrdersCountQuery,
  useUsersCountQuery,
  usePendingWithdrawalsCountQuery,
  useNotificationStatsQuery,
  useAnalyticsOverviewQuery,
} from '@/data/dashboard';
import { useOrdersQuery } from '@/data/order';
import { useWithdrawsQuery } from '@/data/withdraw';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { motion } from 'framer-motion';
import { useState } from 'react';

const SystemStatusCard = dynamic(
  () => import('@/components/dashboard/system-status-card'),
);

// ── Notification stats widget ─────────────────────────────────────────────────

function NotificationStatsWidget() {
  const { t } = useTranslation();
  const { stats } = useNotificationStatsQuery({ retry: false });

  if (!stats) return null;

  const hasFailed = stats.failed > 0 || stats.dead_letter > 0;

  return (
    <div
      className={`mb-6 rounded-lg p-5 ${hasFailed ? 'border border-red-200 bg-red-50' : 'bg-light'}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-heading">
          Notification Health
        </h3>
        <Link
          href={Routes.notifyLogs}
          className="text-sm text-accent hover:underline"
        >
          Manage →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { label: 'Sent', value: stats.sent, color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Failed', value: stats.failed, color: 'text-red-600' },
            { label: 'Dead-letter', value: stats.dead_letter, color: 'text-red-800' },
          ] as const
        ).map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation();
  const [orderPage, setOrderPage] = useState(1);

  const { data: pendingShopsData } = usePendingShopsCountQuery();
  const { data: ordersData } = useOrdersCountQuery();
  const { data: usersData } = useUsersCountQuery();
  const { data: pendingWithdrawalsData } = usePendingWithdrawalsCountQuery();
  const { overview } = useAnalyticsOverviewQuery();

  const pendingShopsCount: number = (pendingShopsData as any)?.total ?? 0;
  const totalOrdersCount: number =
    overview?.total_orders ?? (ordersData as any)?.total ?? 0;
  const totalUsersCount: number =
    overview?.total_customers ?? (usersData as any)?.total ?? 0;
  const pendingWithdrawalsCount: number =
    (pendingWithdrawalsData as any)?.total ?? 0;

  const {
    orders: recentOrders,
    paginatorInfo: orderPaginatorInfo,
    loading: ordersLoading,
  } = useOrdersQuery({ size: 10, page: orderPage });

  const { withdraws, paginatorInfo: withdrawPaginatorInfo } = useWithdrawsQuery({
    size: 5,
    page: 1,
    status: 'PENDING',
  } as any);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* KPI cards */}
      <div className="mb-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StickerCard
          titleTransKey="sticker-card-title-total-order"
          subtitleTransKey="sticker-card-subtitle-order"
          icon={<ShoppingIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#A9ECF5' }}
          price={totalOrdersCount}
        />
        <StickerCard
          titleTransKey="sticker-card-title-today-revenue"
          subtitleTransKey="sticker-card-subtitle-revenue"
          icon={<EaringIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#B798F5' }}
          price={overview?.total_revenue ?? 0}
        />
        <StickerCard
          titleTransKey="sticker-card-title-total-shops"
          subtitleTransKey="sticker-card-subtitle-shops"
          icon={<BasketIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#F5D2C1' }}
          price={overview?.total_shops ?? pendingShopsCount}
          link={Routes.newShops}
          linkText={`${pendingShopsCount} ${t('common:text-pending', { defaultValue: 'pending' })}`}
        />
        <StickerCard
          titleTransKey="sticker-card-title-all-user"
          subtitleTransKey="sticker-card-subtitle-user"
          icon={<ChecklistIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#CCEBF7' }}
          price={totalUsersCount}
        />
      </div>

      {/* System status + notification stats — side by side on large screens */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SystemStatusCard />
        <NotificationStatsWidget />
      </div>

      {/* Pending withdrawals */}
      {pendingWithdrawalsCount > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-heading">
              {t('common:text-pending-withdrawals', {
                defaultValue: 'Pending Withdrawals',
              })}
              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-sm text-accent">
                {pendingWithdrawalsCount}
              </span>
            </h3>
            <Link
              href={Routes.withdraws}
              className="text-sm text-accent hover:underline"
            >
              {t('common:text-view-all', { defaultValue: 'View all' })}
            </Link>
          </div>
          <WithdrawTable
            withdraws={withdraws ?? []}
            paginatorInfo={withdrawPaginatorInfo}
            onPagination={() => {}}
          />
        </div>
      )}

      {/* Recent orders */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-semibold text-heading">
          {t('common:recently-added', { defaultValue: 'Recent Orders' })}
        </h3>
        {ordersLoading ? (
          <Loader text={t('common:text-loading')} />
        ) : (
          <RecentOrders
            orders={recentOrders}
            paginatorInfo={orderPaginatorInfo}
            onPagination={setOrderPage}
            title={t('table:recent-order-table-title')}
          />
        )}
      </div>
    </motion.div>
  );
}

/**
 * A4 — Admin dashboard rebuilt around Kolshi's derivable KPIs.
 *
 * Kolshi has no platform-wide `/analytics` endpoint. KPIs are derived from
 * queue endpoints (pending shops, orders count, users count, pending
 * withdrawals). Each query fetches page 0 / size 1 and reads `total`.
 *
 * Removed: analytics charts, popular products, low-stock chart, top-rated
 * products, product-by-category, revenue widgets, column charts — all
 * depended on missing analytics endpoints.
 *
 * Kept: recent orders list, pending withdrawals table, pending shops link.
 */
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
} from '@/data/dashboard';
import { useOrdersQuery } from '@/data/order';
import { useWithdrawsQuery } from '@/data/withdraw';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Dashboard() {
  const { t } = useTranslation();
  const [orderPage, setOrderPage] = useState(1);

  const { data: pendingShopsData } = usePendingShopsCountQuery();
  const { data: ordersData } = useOrdersCountQuery();
  const { data: usersData } = useUsersCountQuery();
  const { data: pendingWithdrawalsData } = usePendingWithdrawalsCountQuery();

  const pendingShopsCount: number = (pendingShopsData as any)?.total ?? 0;
  const totalOrdersCount: number = (ordersData as any)?.total ?? 0;
  const totalUsersCount: number = (usersData as any)?.total ?? 0;
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
  });

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
          price={0}
          note={t('common:text-not-available', {
            defaultValue: 'No analytics endpoint',
          })}
        />
        <StickerCard
          titleTransKey="sticker-card-title-total-shops"
          subtitleTransKey="sticker-card-subtitle-shops"
          icon={<BasketIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#F5D2C1' }}
          price={pendingShopsCount}
          link={Routes.newShops}
          linkText={t('common:text-pending', { defaultValue: 'pending' })}
        />
        <StickerCard
          titleTransKey="sticker-card-title-all-user"
          subtitleTransKey="sticker-card-subtitle-user"
          icon={<ChecklistIcon className="h-8 w-8" />}
          iconBgStyle={{ backgroundColor: '#CCEBF7' }}
          price={totalUsersCount}
        />
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

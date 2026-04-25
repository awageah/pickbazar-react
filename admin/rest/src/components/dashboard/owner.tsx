/**
 * Store-owner dashboard — A8.
 *
 * Fetches analytics from GET /analytics/shops/{id}?days=30.
 * Renders KPI cards, orders-by-status bar, top products list,
 * and a simple revenue chart (daily points from `revenueChart`).
 *
 * Super-admins who land on this route see the ShopList instead.
 */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import {
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useMeQuery } from '@/data/user';
import { useShopAnalyticsQuery } from '@/data/dashboard';
import StickerCard from '@/components/widgets/sticker-card';
import Loader from '@/components/ui/loader/loader';
import Button from '@/components/ui/button';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import { BasketIcon } from '@/components/icons/summary/basket';
import usePrice from '@/utils/use-price';
import { KolshiTopProduct } from '@/types';

const ShopList = dynamic(() => import('@/components/dashboard/shops/shops'));

// ── Day-range selector ────────────────────────────────────────────────────────

const DAY_OPTIONS = [7, 30, 90, 365] as const;

// ── Revenue mini-chart (pure CSS bar chart) ───────────────────────────────────

function RevenueBars({ points }: { points: { date: string; revenue: number }[] }) {
  if (!points || points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.revenue), 1);
  return (
    <div className="flex h-32 items-end gap-1 overflow-hidden">
      {points.map((p) => (
        <div
          key={p.date}
          className="group relative flex-1 rounded-t bg-accent/70 hover:bg-accent"
          style={{ height: `${Math.max((p.revenue / max) * 100, 2)}%` }}
          title={`${p.date}: ${p.revenue.toFixed(2)}`}
        />
      ))}
    </div>
  );
}

// ── Orders-by-status bar ──────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  ORDER_RECEIVED: 'bg-blue-400',
  PROCESSING: 'bg-yellow-400',
  AT_LOCAL_FACILITY: 'bg-orange-400',
  OUT_FOR_DELIVERY: 'bg-purple-400',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

function OrdersByStatus({ byStatus }: { byStatus: Record<string, number> }) {
  const { t } = useTranslation();
  const entries = Object.entries(byStatus);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <div>
      <div className="mb-2 flex h-4 overflow-hidden rounded-full">
        {entries.map(([status, count]) => (
          <div
            key={status}
            className={`${STATUS_COLOR[status] ?? 'bg-gray-300'}`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${status}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-300'}`}
            />
            <span className="text-xs text-body">
              {status.replace(/_/g, ' ')}: {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Owner layout ──────────────────────────────────────────────────────────────

const OwnerShopLayout = () => {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const [days, setDays] = useState<number>(30);

  // Use first shop belonging to the owner
  const shopId = (me as any)?.shops?.[0]?.id ?? (me as any)?.managed_shop?.id;

  const { analytics, loading, error } = useShopAnalyticsQuery(shopId, days);

  const { price: totalRevenue } = usePrice({
    amount: analytics?.totalRevenue ?? 0,
  });
  const { price: netRevenue } = usePrice({
    amount: analytics?.netRevenue ?? 0,
  });
  const { price: avgOrder } = usePrice({
    amount: analytics?.averageOrderValue ?? 0,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Day-range selector */}
      <div className="mb-6 flex items-center gap-2">
        {DAY_OPTIONS.map((d) => (
          <Button
            key={d}
            onClick={() => setDays(d)}
            variant={days === d ? 'normal' : 'outline'}
            className="h-8 !px-3 text-sm"
          >
            {d === 365 ? '1y' : d === 90 ? '3m' : d === 30 ? '30d' : '7d'}
          </Button>
        ))}
        {error && (
          <span className="text-sm text-red-500">
            Analytics unavailable — please try again later.
          </span>
        )}
      </div>

      {/* KPI cards */}
      {analytics && (
        <>
          <div className="mb-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StickerCard
              titleTransKey="sticker-card-title-rev"
              icon={<EaringIcon className="h-8 w-8" />}
              iconBgStyle={{ backgroundColor: '#A9ECF5' }}
              price={totalRevenue}
            />
            <StickerCard
              titleTransKey="sticker-card-title-total-order"
              icon={<ShoppingIcon className="h-8 w-8" />}
              iconBgStyle={{ backgroundColor: '#B798F5' }}
              price={analytics.totalOrders}
            />
            <StickerCard
              titleTransKey="sticker-card-title-today-rev"
              icon={<BasketIcon className="h-8 w-8" />}
              iconBgStyle={{ backgroundColor: '#F5D2C1' }}
              price={netRevenue}
            />
            <StickerCard
              titleTransKey="sticker-card-title-all-user"
              icon={<ChecklistIcon className="h-8 w-8" />}
              iconBgStyle={{ backgroundColor: '#CCEBF7' }}
              price={analytics.uniqueCustomers}
            />
          </div>

          {/* Orders by status */}
          <div className="mb-6 rounded-lg bg-light p-5">
            <h3 className="mb-4 text-base font-semibold text-heading">
              Orders by Status
            </h3>
            <OrdersByStatus byStatus={analytics.ordersByStatus} />
          </div>

          {/* Revenue chart */}
          {analytics.revenueChart?.length > 0 && (
            <div className="mb-6 rounded-lg bg-light p-5">
              <h3 className="mb-4 text-base font-semibold text-heading">
                Revenue ({days} days)
              </h3>
              <RevenueBars points={analytics.revenueChart} />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{analytics.revenueChart[0]?.date}</span>
                <span>
                  {analytics.revenueChart[analytics.revenueChart.length - 1]?.date}
                </span>
              </div>
            </div>
          )}

          {/* Top products */}
          {analytics.topProducts?.length > 0 && (
            <div className="mb-6 rounded-lg bg-light p-5">
              <h3 className="mb-4 text-base font-semibold text-heading">
                Top Products
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-200">
                    <th className="pb-2 text-left font-medium text-gray-500">
                      Product
                    </th>
                    <th className="pb-2 text-right font-medium text-gray-500">
                      Units sold
                    </th>
                    <th className="pb-2 text-right font-medium text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((p: KolshiTopProduct) => (
                    <tr
                      key={p.productId}
                      className="border-b border-border-200/50"
                    >
                      <td className="py-2">{p.productName}</td>
                      <td className="py-2 text-right">{p.totalSold}</td>
                      <td className="py-2 text-right font-medium text-heading">
                        {p.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Avg order value + repeat customer info */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-lg bg-light p-5">
              <p className="text-xs text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-heading">{avgOrder}</p>
            </div>
            <div className="rounded-lg bg-light p-5">
              <p className="text-xs text-gray-500">Repeat Customers</p>
              <p className="text-2xl font-bold text-heading">
                {analytics.repeatCustomers}
              </p>
            </div>
            <div className="rounded-lg bg-light p-5">
              <p className="text-xs text-gray-500">Low-stock Products</p>
              <p className="text-2xl font-bold text-heading">
                {analytics.lowStockProducts}
              </p>
            </div>
          </div>
        </>
      )}

      {!analytics && !loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-light">
          <p className="text-body">
            {shopId
              ? 'No analytics data available for the selected period.'
              : 'No shop found for your account.'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ── Root component ────────────────────────────────────────────────────────────

const OwnerDashboard = () => {
  const { permissions } = getAuthCredentials();
  return hasAccess(adminOnly, permissions) ? <ShopList /> : <OwnerShopLayout />;
};

export default OwnerDashboard;

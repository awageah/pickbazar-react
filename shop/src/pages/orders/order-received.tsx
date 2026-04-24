import { getLayout } from '@/components/layouts/layout';
import Seo from '@/components/seo/seo';
import Link from '@/components/ui/link';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import Alert from '@/components/ui/alert';
import { CheckMark } from '@/components/icons/checkmark';
import { HomeIconNew } from '@/components/icons/home-icon-new';
import { Routes } from '@/config/routes';
import { useOrder } from '@/framework/order';
import { useCart } from '@/store/quick-cart/cart.context';
import { clearCheckoutAtom } from '@/store/checkout';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import usePrice from '@/lib/use-price';

export { getStaticProps } from '@/framework/general.ssr';

/**
 * Kolshi F.3.5 — Multi-shop order confirmation page.
 *
 * The backend returns one `Order` per shop from `POST /orders`, so after
 * checkout we land here with a comma-separated list of tracking numbers
 * (`?ids=TN-1,TN-2,...`) and render a summary card per order. Each card
 * links to the full order detail page at `/orders/[tracking_number]`.
 */
function OrderSummaryCard({ trackingNumber }: { trackingNumber: string }) {
  const { t } = useTranslation('common');
  const { order, isLoading } = useOrder({ tracking_number: trackingNumber });

  const paidTotal = Number(
    (order as any)?.paid_total ?? (order as any)?.total ?? 0,
  );
  const { price: total } = usePrice({ amount: paidTotal });

  const shopName =
    (order as any)?.shop?.name ??
    (order as any)?.shop_name ??
    t('text-shop');

  return (
    <div className="rounded border border-border-200 bg-light p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-body">
            {t('text-order-number')}
          </p>
          <p className="mt-1 text-lg font-bold text-heading break-all">
            {trackingNumber}
          </p>
          {!isLoading && shopName && (
            <p className="mt-1 text-sm text-body">{shopName}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-body">{t('text-total')}</p>
          <p className="text-lg font-semibold text-heading">
            {isLoading ? '…' : total}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={Routes.order(trackingNumber)}
          className="inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-semibold text-light transition hover:bg-accent-hover"
        >
          {t('text-view-order')}
        </Link>
        <Link
          href={`${Routes.trackOrder}?tracking_number=${encodeURIComponent(
            trackingNumber,
          )}`}
          className="inline-flex h-10 items-center rounded border border-border-200 px-4 text-sm font-semibold text-heading transition hover:border-accent hover:text-accent"
        >
          {t('text-track-order')}
        </Link>
      </div>
    </div>
  );
}

export default function OrderReceivedPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { resetCart } = useCart();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);

  const ids = useMemo(() => {
    const raw = router.query.ids;
    if (!raw) return [] as string[];
    const flat = Array.isArray(raw) ? raw.join(',') : raw;
    return flat
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [router.query.ids]);

  useEffect(() => {
    if (!router.isReady) return;
    resetCart();
    // @ts-ignore - atom setter signature is `(update?: unknown) => void`
    resetCheckout();
  }, [router.isReady, resetCart, resetCheckout]);

  if (!router.isReady) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Spinner simple className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      <Seo noindex nofollow />
      <div className="bg-gray-100 px-4 py-10 lg:px-8 xl:py-14 xl:px-16 2xl:px-20">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6">
            <Link
              href={Routes.home}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
            >
              <HomeIconNew />
              {t('text-back-to-home')}
            </Link>
          </div>

          <div className="mb-8 flex items-start gap-3 rounded bg-accent/10 p-5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
              <CheckMark className="h-3 w-3 text-light" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-heading">
                {t('text-thank-you-for-order')}
              </h1>
              <p className="mt-1 text-sm text-body">
                {ids.length > 1
                  ? t('text-multi-order-split-notice')
                  : t('text-order-placed-successfully')}
              </p>
            </div>
          </div>

          {ids.length === 0 ? (
            <Alert
              variant="info"
              message={t('text-no-orders-in-url') as string}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {ids.map((tn) => (
                <OrderSummaryCard key={tn} trackingNumber={tn} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

OrderReceivedPage.authenticationRequired = true;
OrderReceivedPage.getLayout = getLayout;

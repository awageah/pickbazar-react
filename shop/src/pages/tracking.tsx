import { getLayout } from '@/components/layouts/layout';
import Seo from '@/components/seo/seo';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usePublicTracking } from '@/framework/order';

export { getStaticProps } from '@/framework/general.ssr';

const ORDER_STATUS_LABELS: Record<string, string> = {
  ORDER_PENDING: 'Order Placed',
  ORDER_PROCESSING: 'Processing',
  ORDER_AT_LOCAL_FACILITY: 'At Local Facility',
  ORDER_OUT_FOR_DELIVERY: 'Out for Delivery',
  ORDER_COMPLETED: 'Delivered',
  ORDER_CANCELLED: 'Cancelled',
  ORDER_FAILED: 'Failed',
  // Legacy aliases from admin OrderStatus enum
  ORDER_RECEIVED: 'Order Placed',
  PROCESSING: 'Processing',
  AT_LOCAL_FACILITY: 'At Local Facility',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function formatOrderStatus(raw: string): string {
  return ORDER_STATUS_LABELS[raw] ?? raw.replace(/_/g, ' ');
}

/**
 * Kolshi H.2 — Public order tracking page.
 *
 * Route: `/tracking` (matches Kolshi handoff spec).
 * Guests (and authenticated users) can look up any order by pairing the
 * tracking number printed on their receipt with the contact information
 * used at checkout (phone or email). Backed by
 * `GET /tracking/{trackingNumber}?contact=`.
 */
export default function TrackOrderPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const tn = (router.query.tracking_number ?? '') as string;
    const c = (router.query.contact ?? '') as string;
    if (tn) setTrackingNumber(tn);
    if (c) setContact(c);
    if (tn && c) setSubmitted(true);
  }, [router.isReady, router.query.tracking_number, router.query.contact]);

  const { tracking, isFetching, error } = usePublicTracking({
    trackingNumber: submitted ? trackingNumber : undefined,
    contact: submitted ? contact : undefined,
    enabled: submitted,
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackingNumber.trim() || !contact.trim()) return;
    setSubmitted(true);
    router.replace(
      {
        pathname: router.pathname,
        query: {
          tracking_number: trackingNumber.trim(),
          contact: contact.trim(),
        },
      },
      undefined,
      { shallow: true },
    );
  }

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const anyErr = error as any;
    return (
      anyErr?.response?.data?.message ||
      anyErr?.message ||
      (t('error-tracking-not-found') as string)
    );
  }, [error, t]);

  return (
    <>
      <Seo
        title={t('text-track-order')}
        description={t('text-track-order-description')}
      />
      <div className="bg-gray-100 px-4 py-10 lg:px-8 xl:py-14 xl:px-16 2xl:px-20">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded border bg-light p-6 shadow-sm md:p-8">
            <h1 className="text-2xl font-bold text-heading">
              {t('text-track-order')}
            </h1>
            <p className="mt-2 text-sm text-body">
              {t('text-track-order-description')}
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <Input
                label={t('text-tracking-number')}
                name="tracking_number"
                placeholder={t('text-tracking-number-placeholder') as string}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
              />
              <Input
                label={t('text-contact-info')}
                name="contact"
                placeholder={t('text-contact-info-placeholder') as string}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
              <Button
                type="submit"
                loading={isFetching && submitted}
                disabled={isFetching && submitted}
                className="w-full"
              >
                {t('text-track-order')}
              </Button>
            </form>
          </div>

          {submitted && isFetching && !tracking && (
            <div className="mt-8 flex justify-center">
              <Spinner simple className="h-10 w-10" />
            </div>
          )}

          {submitted && errorMessage && !tracking && (
            <div className="mt-6">
              <Alert variant="error" message={errorMessage} />
            </div>
          )}

          {tracking && (
            <div className="mt-8 rounded border bg-light p-6 shadow-sm md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-body">
                    {t('text-order-number')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-heading break-all">
                    {tracking.tracking_number}
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {formatOrderStatus(tracking.order_status)}
                </span>
              </div>

              {tracking.shop?.name && (
                <p className="mt-2 text-sm text-body">
                  {t('text-shop')}: <strong>{tracking.shop.name}</strong>
                </p>
              )}

              {tracking.estimated_delivery && (
                <p className="mt-2 text-sm text-body">
                  {t('text-estimated-delivery')}:{' '}
                  <strong>
                    {dayjs(tracking.estimated_delivery).format('MMM D, YYYY')}
                  </strong>
                </p>
              )}

              <div className="mt-6">
                <h2 className="mb-4 text-base font-semibold text-heading">
                  {t('text-order-timeline')}
                </h2>
                <ol className="relative space-y-6 border-l border-border-200 pl-6">
                  {(tracking.history ?? []).map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute -left-8 mt-1 flex h-3 w-3 rounded-full bg-accent" />
                      <p className="text-sm font-semibold text-heading">
                        {formatOrderStatus(entry.status)}
                      </p>
                      <p className="text-xs text-body">
                        {entry.created_at
                          ? dayjs(entry.created_at).format('MMM D, YYYY HH:mm')
                          : null}
                      </p>
                      {entry.note && (
                        <p className="mt-1 text-sm text-body">{entry.note}</p>
                      )}
                    </li>
                  ))}
                  {!tracking.history?.length && (
                    <li className="text-sm text-body">
                      {t('text-no-history-yet')}
                    </li>
                  )}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

TrackOrderPage.getLayout = getLayout;

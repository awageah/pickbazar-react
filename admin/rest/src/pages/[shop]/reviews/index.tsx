import Card from '@/components/common/card';
import Layout from '@/components/layouts/shop';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReviewsQuery, useAddReviewResponseMutation, useDeleteReviewResponseMutation } from '@/data/review';
import { adminAndOwnerOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useRouter } from 'next/router';
import { Review, ReviewResponse } from '@/types';
import { StarIcon } from '@/components/icons/star-icon';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { NoDataFound } from '@/components/icons/no-data-found';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Input from '@/components/ui/input';

dayjs.extend(relativeTime);

// ── Inline response panel per review ────────────────────────────────────────

function ReviewResponsePanel({ review }: { review: Review }) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const { mutate: addResponse, isLoading: adding } = useAddReviewResponseMutation();
  const { mutate: deleteResponse, isLoading: deleting } =
    useDeleteReviewResponseMutation();

  const existingResponse = review.response as ReviewResponse | null;

  function handleSubmit() {
    if (!responseText.trim()) return;
    addResponse(
      { reviewId: review.id, response: responseText.trim() },
      { onSuccess: () => { setShowForm(false); setResponseText(''); } },
    );
  }

  function handleDelete() {
    if (!existingResponse) return;
    deleteResponse({ responseId: existingResponse.id, reviewId: review.id });
  }

  return (
    <div className="mt-2">
      {existingResponse ? (
        <div className="rounded bg-gray-50 p-3 text-sm">
          <p className="mb-1 font-semibold text-gray-700">Your response:</p>
          <p className="text-body">{existingResponse.response}</p>
          <button
            onClick={handleDelete}
            className="mt-2 text-xs text-red-500 hover:underline"
            disabled={deleting}
          >
            {deleting ? 'Removing…' : 'Remove response'}
          </button>
        </div>
      ) : (
        <>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-medium text-accent hover:underline"
            >
              + Respond to this review
            </button>
          )}
          {showForm && (
            <div className="mt-2">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                placeholder="Thank you for your feedback…"
                className="mb-2 w-full rounded border border-border-200 px-3 py-2 text-sm focus:outline-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmit} loading={adding} className="h-8 text-sm">
                  Post Response
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="h-8 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ShopReviews() {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [productIdFilter, setProductIdFilter] = useState('');

  const params: any = { limit: 10, page };
  if (productIdFilter) {
    params.product_id = productIdFilter;
  }

  const { reviews, paginatorInfo, loading, error } = useReviewsQuery(params);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <PageHeading title={t('form:input-label-reviews')} />
        </div>
        <div className="w-full max-w-xs">
          <Input
            label="Filter by Product ID"
            value={productIdFilter}
            onChange={(e: any) => {
              setProductIdFilter(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. 101"
            variant="outline"
          />
        </div>
      </Card>

      {reviews.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-10">
            <NoDataFound className="w-40" />
            <p className="mt-4 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <Card key={review.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-heading">
                    {review.productName ?? `Product #${review.productId}`}
                  </p>
                  <p className="text-sm text-body">{review.customerName ?? '—'}</p>
                </div>
                <div className="inline-flex items-center rounded-full border border-accent px-3 py-0.5 text-accent">
                  {review.rating}
                  <StarIcon className="ms-1 h-3 w-3" />
                </div>
              </div>

              {review.isVerifiedPurchase && (
                <Badge text="Verified Purchase" color="bg-green-100 text-green-600" />
              )}

              {review.comment && (
                <p className="text-sm text-body">{review.comment}</p>
              )}

              <p className="text-xs text-gray-400">
                {dayjs(review.createdAt).fromNow()}
              </p>

              <ReviewResponsePanel review={review} />
            </Card>
          ))}
        </div>
      )}

      {!!paginatorInfo?.total && (
        <div className="mt-6 flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}

ShopReviews.authenticate = { permissions: adminAndOwnerOnly };
ShopReviews.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

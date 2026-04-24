/**
 * Product-review hooks — Kolshi I.1.
 *
 * Endpoints:
 *   - `GET  /reviews/product/{productId}`            — paginated list
 *   - `GET  /reviews/{reviewId}`                     — single review
 *   - `POST /reviews`                                — create
 *   - `DELETE /reviews/{reviewId}`                   — delete (author or admin)
 *   - `GET  /reviews/products/{productId}/summary`   — aggregate stats
 *   - `GET  /reviews/products/{productId}/rating`    — `{ averageRating, totalReviews }`
 *   - `POST /reviews/{reviewId}/vote`                — helpful / not-helpful
 *   - `DELETE /reviews/{reviewId}/vote`              — remove vote
 *
 * Kolshi has no `PUT /reviews/{id}` — the "update my review" flow is
 * synthesised as `delete` + `create` here so the existing review form
 * keeps its edit path.
 */
import { useModalAction } from '@/components/ui/modal/modal.context';
import type {
  CreateReviewInput,
  Review,
  ReviewPaginator,
  ReviewQueryOptions,
  ReviewSummary,
  ReviewVoteType,
  UpdateReviewInput,
} from '@/types';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from './utils/data-mappers';

/**
 * `useReviews` — paginated reviews for a product.
 *
 * The Kolshi controller accepts one of `helpful | rating | date` for
 * `sortBy`; the legacy caller passes `orderBy=helpful_count` +
 * `sortedBy=desc` and similar combinations. We translate here so
 * existing `<Sorting />` / `<StarFilter />` components keep working.
 */
export function useReviews(options?: Partial<ReviewQueryOptions>) {
  const normalized = normalizeReviewQuery(options);
  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useQuery<ReviewPaginator, Error>(
    [API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT, normalized],
    ({ queryKey }) =>
      client.reviews.all(queryKey[1] as ReviewQueryOptions),
    {
      enabled: Boolean(normalized.product_id),
      keepPreviousData: true,
    },
  );
  return {
    reviews: response?.data ?? [],
    paginatorInfo: mapPaginatorData(response),
    isLoading,
    error,
    isFetching,
    hasMore: Boolean(
      response && response?.last_page > response?.current_page,
    ),
  };
}

export function useReview({ id }: { id: string | number }) {
  const { data, isLoading, error } = useQuery<Review, Error>(
    [API_ENDPOINTS.PRODUCTS_REVIEWS, String(id)],
    () => client.reviews.get({ id }),
    {
      enabled: Boolean(id),
    },
  );
  return { review: data, isLoading, error };
}

export function useReviewSummary(productId: string | number | undefined) {
  const { data, isLoading, error } = useQuery<ReviewSummary, Error>(
    [API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY, String(productId ?? '')],
    () => client.reviews.summary(productId!),
    {
      enabled: Boolean(productId),
      staleTime: 60_000,
    },
  );
  return { summary: data, isLoading, error };
}

export function useCreateReview() {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  const { mutate: createReview, isLoading } = useMutation(
    (input: CreateReviewInput) => client.reviews.create(input),
    {
      onSuccess: () => {
        toast.success(`${t('text-review-request-submitted')}`);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            `${t(error.response?.data?.message ?? 'error-review-submit')}`,
          );
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS]);
        queryClient.invalidateQueries([
          API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT,
        ]);
        if (variables?.product_id) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY,
            String(variables.product_id),
          ]);
        }
        closeModal();
      },
    },
  );
  return { createReview, isLoading };
}

/**
 * `useUpdateReview` — Kolshi has no update endpoint, so we delete the
 * existing review and create a new one. The existing `ReviewForm`
 * still calls `updateReview({ id, ...patch })` so we accept the same
 * payload and unpack internally.
 */
export function useUpdateReview() {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  const { mutate: updateReview, isLoading } = useMutation(
    async (input: UpdateReviewInput) => {
      await client.reviews.delete(input.id);
      const { id: _omit, ...create } = input;
      return client.reviews.create(create);
    },
    {
      onSuccess: () => {
        toast.success(`${t('text-review-request-update-submitted')}`);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            `${t(error.response?.data?.message ?? 'error-review-submit')}`,
          );
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([API_ENDPOINTS.ORDERS]);
        queryClient.invalidateQueries([
          API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT,
        ]);
        if (variables?.product_id) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY,
            String(variables.product_id),
          ]);
        }
        closeModal();
      },
    },
  );
  return { updateReview, isLoading };
}

export function useDeleteReview() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { mutate: deleteReview, isLoading } = useMutation(
    (id: string | number) => client.reviews.delete(id),
    {
      onSuccess: () => {
        toast.success(`${t('text-review-deleted')}`);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            `${t(error.response?.data?.message ?? 'error-review-delete')}`,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT,
        ]);
        queryClient.invalidateQueries([
          API_ENDPOINTS.PRODUCT_REVIEWS_SUMMARY,
        ]);
      },
    },
  );
  return { deleteReview, isLoading };
}

/**
 * `useVoteReview` — casts / changes a helpful / not-helpful vote on a
 * review. Voting is idempotent on the backend (re-posting the same
 * vote type is a no-op), and submitting the opposite type flips the
 * vote atomically.
 */
export function useVoteReview(productId?: string | number) {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { mutate: voteReview, isLoading } = useMutation(
    ({ reviewId, voteType }: { reviewId: string | number; voteType: ReviewVoteType }) =>
      client.reviews.vote({ reviewId, voteType }),
    {
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          toast.error(
            status === 400
              ? `${t('error-cannot-vote-own-review')}`
              : `${t(error.response?.data?.message ?? 'error-vote-failed')}`,
          );
        }
      },
      onSettled: () => {
        if (productId) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT,
          ]);
        }
      },
    },
  );
  return { voteReview, isLoading };
}

export function useRemoveReviewVote(productId?: string | number) {
  const queryClient = useQueryClient();
  const { mutate: removeVote, isLoading } = useMutation(
    (reviewId: string | number) => client.reviews.removeVote(reviewId),
    {
      onSettled: () => {
        if (productId) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.PRODUCT_REVIEWS_BY_PRODUCT,
          ]);
        }
      },
    },
  );
  return { removeVote, isLoading };
}

/**
 * Translates legacy Pickbazar query params into Kolshi-native ones.
 *
 *   - `orderBy=positive_feedbacks_count` + `sortedBy=desc` → `sortBy=helpful`.
 *   - `orderBy=rating` + `sortedBy=desc` → `sortBy=rating`.
 *   - Anything else collapses to `sortBy=date` (Kolshi's default).
 *   - Legacy rating filter payloads arrive as strings (`"5"`); the
 *     adapter coerces them to numbers.
 */
function normalizeReviewQuery(
  options?: Partial<ReviewQueryOptions>,
): Partial<ReviewQueryOptions> {
  if (!options) return {};
  const { orderBy, sortedBy, sortBy, rating, ...rest } = options;
  const derivedSort: ReviewQueryOptions['sortBy'] = sortBy
    ? sortBy
    : orderBy
    ? mapLegacyReviewSort(orderBy, sortedBy)
    : undefined;
  return {
    ...rest,
    ...(rating !== undefined && rating !== null && rating !== ''
      ? { rating }
      : {}),
    ...(derivedSort ? { sortBy: derivedSort } : {}),
  };
}

function mapLegacyReviewSort(
  orderBy: string | undefined,
  _sortedBy: string | undefined,
): ReviewQueryOptions['sortBy'] | undefined {
  if (!orderBy) return undefined;
  const key = String(orderBy).toLowerCase();
  if (key.includes('helpful') || key.includes('positive')) return 'helpful';
  if (key.includes('rating')) return 'rating';
  if (key.includes('date') || key.includes('created')) return 'date';
  return undefined;
}

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Review, ReviewPaginator, ReviewQueryOptions, ReviewResponse } from '@/types';
import { reviewClient } from '@/data/client/review';
import { normalizeApiError } from '@/utils/error-handler';

/** @deprecated Abuse-report flow not in Kolshi — no-op stub for compile compat. */
export const useAbuseReportMutation = () => {
  return useMutation(reviewClient.reportAbuse);
};

/** @deprecated Decline flow not in Kolshi — no-op stub for compile compat. */
export const useDeclineReviewMutation = () => {
  return useMutation(reviewClient.decline);
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(reviewClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(normalizeApiError(error)?.message ?? 'Request failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.REVIEWS);
    },
  });
};

export const useReviewQuery = (id: string) => {
  return useQuery<Review, Error>([API_ENDPOINTS.REVIEWS, id], () =>
    reviewClient.get({ id }),
  );
};

/** Paginated reviews — optionally scoped by productId. */
export const useReviewsQuery = (
  params: Partial<ReviewQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<ReviewPaginator, Error>(
    [API_ENDPOINTS.REVIEWS, params],
    ({ queryKey, pageParam }) =>
      reviewClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)) as any,
    { keepPreviousData: true, ...options },
  );
  return {
    reviews: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

// ── Review response hooks (store_owner) ─────────────────────────────────────

export const useReviewResponseQuery = (
  reviewId: string | number,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<ReviewResponse | null, Error>(
    [API_ENDPOINTS.REVIEW_RESPONSE, reviewId],
    () => reviewClient.getResponse(reviewId),
    { enabled: Boolean(reviewId), ...options },
  );
  return { reviewResponse: data ?? null, error, loading: isLoading };
};

export const useAddReviewResponseMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ reviewId, response }: { reviewId: string | number; response: string }) =>
      reviewClient.addResponse(reviewId, response),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-created'));
      },
      onError: (error: any) => {
        toast.error(normalizeApiError(error)?.message ?? 'Request failed');
      },
      onSettled: (_d, _e, vars) => {
        queryClient.invalidateQueries([API_ENDPOINTS.REVIEW_RESPONSE, vars.reviewId]);
        queryClient.invalidateQueries(API_ENDPOINTS.REVIEWS);
      },
    },
  );
};

export const useDeleteReviewResponseMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ responseId }: { responseId: number; reviewId: string | number }) =>
      reviewClient.deleteResponse(responseId),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-deleted'));
      },
      onError: (error: any) => {
        toast.error(normalizeApiError(error)?.message ?? 'Request failed');
      },
      onSettled: (_d, _e, vars) => {
        queryClient.invalidateQueries([API_ENDPOINTS.REVIEW_RESPONSE, vars.reviewId]);
        queryClient.invalidateQueries(API_ENDPOINTS.REVIEWS);
      },
    },
  );
};

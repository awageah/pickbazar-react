import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Category, CategoryPaginator, CategoryQueryOptions } from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { categoryClient, KolshiCategoryInput } from './client/category';
import { toPaginatorInfo } from '@/utils/pagination';
import { normalizeApiError } from '@/utils/error-handler';

// ── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    (data: KolshiCategoryInput) => categoryClient.create(data),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-created'));
        Router.push(Routes.category.list);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
      },
    },
  );
};

export const useUpdateCategoryMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(
    (data: KolshiCategoryInput & { id: string | number }) =>
      categoryClient.update(data),
    {
      onSuccess: (updated: Category) => {
        toast.success(t('common:successfully-updated'));
        Router.push(`${Routes.category.list}/${updated.slug}/edit`);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
      },
    },
  );
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(categoryClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (err: any) => {
      toast.error(normalizeApiError(err).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
    },
  });
};

// ── Queries ──────────────────────────────────────────────────────────────────

export const useCategoryQuery = ({ slug }: { slug: string; language?: string }) => {
  const { data, error, isLoading } = useQuery<Category, Error>(
    [API_ENDPOINTS.CATEGORIES, { slug }],
    () => categoryClient.get({ slug }),
  );

  return { category: data, error, isLoading };
};

export const useCategoriesQuery = (options: Partial<CategoryQueryOptions>) => {
  const { data, error, isLoading } = useQuery<CategoryPaginator, Error>(
    [API_ENDPOINTS.CATEGORIES, options],
    ({ queryKey, pageParam }) =>
      categoryClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)),
    { keepPreviousData: true },
  );

  return {
    categories: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

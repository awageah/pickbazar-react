import { useMutation, useQuery, useQueryClient } from 'react-query';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { staffClient, StaffListParams } from './client/staff';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';
import { AddStaffInput } from '@/types';

/** React-Query key factory for shop staff lists */
const staffKey = (shopId: string | number) =>
  [API_ENDPOINTS.SHOPS, String(shopId), 'staff'] as const;

export const useStaffsQuery = (
  params: StaffListParams,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery(
    [...staffKey(params.shopId), params.page],
    () => staffClient.paginated(params),
    {
      keepPreviousData: true,
      enabled: Boolean(params.shopId),
      ...options,
    },
  );

  return {
    staffs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useAddStaffMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation(
    (input: AddStaffInput) => staffClient.addStaff(input),
    {
      onSuccess: (_, { shopId }) => {
        toast.success(t('common:successfully-created'));
        router.push(`/${router?.query?.shop}${Routes.staff.list}`);
        queryClient.invalidateQueries(staffKey(shopId));
      },
      onError: () => {
        toast.error(t('common:text-something-went-wrong'));
      },
    },
  );
};

export const useRemoveStaffMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    (variables: { shopId: string | number; staffId: string | number }) =>
      staffClient.removeStaff(variables),
    {
      onSuccess: (_, { shopId }) => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries(staffKey(shopId));
      },
      onError: () => {
        toast.error(t('common:text-something-went-wrong'));
      },
    },
  );
};

import Cookies from 'js-cookie';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { userClient } from './client/user';
import {
  User,
  QueryOptionsType,
  UserPaginator,
  UserQueryOptions,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { Routes } from '@/config/routes';
import { getAuthCredentials } from '@/utils/auth-utils';

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'AUTH_CRED';

// ── Session ──────────────────────────────────────────────────────────────────

/**
 * Fetches the current session user. Drives email-verification routing:
 * if `email_verified === false` the user is bounced to `/verify-email`.
 * The old 417 (license) + 409 (email) HTTP-status routing is replaced by
 * checking `me.email_verified` on success — Kolshi always returns 200 for
 * an authenticated request to `/me`.
 */
export const useMeQuery = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useQuery<User, Error>([API_ENDPOINTS.ME], userClient.me, {
    retry: false,
    onSuccess: (data) => {
      if (data?.email_verified === false) {
        router.replace(Routes.verifyEmail);
      }
    },
    onError: () => {
      queryClient.clear();
      router.replace(Routes.login);
    },
  });
};

export function useLogin() {
  return useMutation(userClient.login);
}

/**
 * Client-side logout — Kolshi JWTs are stateless; evicting the cookie and
 * clearing the cache is sufficient.  No server call is made.
 */
export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.logout, {
    onSuccess: () => {
      Cookies.remove(AUTH_TOKEN_KEY);
      queryClient.clear();
      router.replace(Routes.login);
      toast.success(t('common:successfully-logout'), {
        toastId: 'logoutSuccess',
      });
    },
  });
};

// ── Password recovery ─────────────────────────────────────────────────────────

export const useForgetPasswordMutation = () => {
  return useMutation(userClient.forgetPassword);
};

export const useVerifyForgetPasswordTokenMutation = () => {
  return useMutation(userClient.verifyForgetPasswordToken);
};

export const useResetPasswordMutation = () => {
  return useMutation(userClient.resetPassword);
};

// ── Email verification ────────────────────────────────────────────────────────

export const useResendVerificationEmail = () => {
  const { t } = useTranslation('common');
  return useMutation(userClient.resendVerificationEmail, {
    onSuccess: () => {
      toast.success(t('common:PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL'));
    },
    onError: () => {
      toast.error(t('common:PICKBAZAR_MESSAGE.EMAIL_SENT_FAILED'));
    },
  });
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const useUpdateUserMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(userClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ME);
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};

export const useChangePasswordMutation = () => {
  const { t } = useTranslation();
  return useMutation(userClient.changePassword, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('common:error-something-wrong'));
    },
  });
};

/** PUT /me/profile — updates the authenticated user's own bio/contact/avatar. */
export const useUpdateProfileMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(
    (input: { bio?: string; contact?: string; avatar?: string }) =>
      userClient.updateMe(input),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries(API_ENDPOINTS.ME);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? t('common:error-something-wrong'),
        );
      },
    },
  );
};

// ── User management (A3) ──────────────────────────────────────────────────────

export const useUserQuery = ({ id }: { id: string }) => {
  return useQuery<User, Error>(
    [API_ENDPOINTS.USERS, id],
    () => userClient.fetchUser({ id }),
    { enabled: Boolean(id) },
  );
};

export const useUsersQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.USERS, params],
    () => userClient.fetchUsers(params),
    { keepPreviousData: true },
  );
  return {
    users: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

export const useAdminsQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.ADMIN_LIST, params],
    () => userClient.fetchAdmins(params),
    { keepPreviousData: true },
  );
  return {
    admins: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

export const useVendorsQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.VENDORS_LIST, params],
    () => userClient.fetchVendors(params),
    { keepPreviousData: true },
  );
  return {
    vendors: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

export const useCustomersQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.CUSTOMERS, params],
    () => userClient.fetchCustomers(params),
    { keepPreviousData: true },
  );
  return {
    customers: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

// ── Admin actions (A3) ────────────────────────────────────────────────────────

/** Replaces the old make-admin / revoke-admin split; uses /users/{id}/role. */
export const useChangeRoleMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation(userClient.changeRole, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};

/** @deprecated Use useChangeRoleMutation — kept as alias for existing callers. */
export const useMakeOrRevokeAdminMutation = useChangeRoleMutation;

export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation(userClient.block, {
    onSuccess: () => {
      toast.success(t('common:successfully-block'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.STAFFS);
    },
  });
};

export const useUnblockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation(userClient.unblock, {
    onSuccess: () => {
      toast.success(t('common:successfully-unblock'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.STAFFS);
    },
  });
};

// ── Staff (A3) ────────────────────────────────────────────────────────────────

export const useMyStaffsQuery = (
  params: Partial<UserQueryOptions & { shopId: string }>,
) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.MY_STAFFS, params],
    () => userClient.getMyStaffs(params),
    { keepPreviousData: true },
  );
  return {
    myStaffs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

export const useAllStaffsQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.ALL_STAFFS, params],
    () => userClient.getAllStaffs(params),
    { keepPreviousData: true },
  );
  return {
    allStaffs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

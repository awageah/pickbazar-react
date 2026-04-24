import {
  AuthResponse,
  LoginInput,
  User,
  ChangePasswordInput,
  ForgetPasswordInput,
  VerifyForgetPasswordTokenInput,
  ResetPasswordInput,
  UpdateUser,
  UserPaginator,
  UserQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import type { CallerPageParams } from '@/utils/pagination';

export const userClient = {
  // ── Session ────────────────────────────────────────────────────────────────

  me: (): Promise<User> => {
    return HttpClient.get<User>(API_ENDPOINTS.ME);
  },

  login: (variables: LoginInput): Promise<AuthResponse> => {
    return HttpClient.post<AuthResponse>(API_ENDPOINTS.TOKEN, variables);
  },

  /**
   * Admin logout is client-side only — Kolshi JWTs are stateless; the only
   * required action is evicting the AUTH_CRED cookie and clearing the
   * React-Query cache (done in the hook).
   */
  logout: (): Promise<void> => Promise.resolve(),

  // ── Password recovery ──────────────────────────────────────────────────────

  forgetPassword: (variables: ForgetPasswordInput): Promise<{ success: boolean }> => {
    return HttpClient.post<{ success: boolean }>(
      API_ENDPOINTS.FORGET_PASSWORD,
      variables,
    );
  },

  /** Kolshi verify-reset-token only accepts { token }; no email in body. */
  verifyForgetPasswordToken: (
    variables: VerifyForgetPasswordTokenInput,
  ): Promise<{ success: boolean }> => {
    return HttpClient.post<{ success: boolean }>(
      API_ENDPOINTS.VERIFY_FORGET_PASSWORD_TOKEN,
      variables,
    );
  },

  /** Kolshi reset-password accepts { token, newPassword }. */
  resetPassword: (variables: ResetPasswordInput): Promise<{ success: boolean }> => {
    return HttpClient.post<{ success: boolean }>(
      API_ENDPOINTS.RESET_PASSWORD,
      variables,
    );
  },

  resendVerificationEmail: (): Promise<void> => {
    return HttpClient.post<void>(API_ENDPOINTS.SEND_VERIFICATION_EMAIL, {});
  },

  // ── Profile ────────────────────────────────────────────────────────────────

  update: ({ id, input }: { id: string; input: UpdateUser }): Promise<User> => {
    return HttpClient.put<User>(`${API_ENDPOINTS.USERS}/${id}`, input);
  },

  /** PUT /me/profile — edits the currently authenticated user's own profile. */
  updateMe: (input: { bio?: string; contact?: string; avatar?: string }): Promise<User> => {
    return HttpClient.put<User>(API_ENDPOINTS.PROFILE_UPDATE, input);
  },

  changePassword: (variables: ChangePasswordInput): Promise<void> => {
    return HttpClient.put<void>(API_ENDPOINTS.CHANGE_PASSWORD, variables);
  },

  // ── User management (used by A3) ──────────────────────────────────────────

  fetchUser: ({ id }: { id: string }): Promise<User> => {
    return HttpClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },

  fetchUsers: (params: Partial<UserQueryOptions>): Promise<UserPaginator> => {
    return HttpClient.getPaginated<User>(API_ENDPOINTS.USERS, params as CallerPageParams);
  },

  /** Super-admin list: filter by role=super_admin server-side. */
  fetchAdmins: (params: Partial<UserQueryOptions>): Promise<UserPaginator> => {
    return HttpClient.getPaginated<User>(API_ENDPOINTS.USERS, {
      ...params,
      role: 'super_admin',
    } as CallerPageParams);
  },

  /** Store-owner list: filter by role=store_owner server-side. */
  fetchVendors: (params: Partial<UserQueryOptions>): Promise<UserPaginator> => {
    return HttpClient.getPaginated<User>(API_ENDPOINTS.USERS, {
      ...params,
      role: 'store_owner',
    } as CallerPageParams);
  },

  /** Customer list: filter by role=customer server-side. */
  fetchCustomers: (params: Partial<UserQueryOptions>): Promise<UserPaginator> => {
    return HttpClient.getPaginated<User>(API_ENDPOINTS.USERS, {
      ...params,
      role: 'customer',
    } as CallerPageParams);
  },

  // ── Admin actions (used by A3) ─────────────────────────────────────────────

  /** POST /users/{id}/block */
  block: ({ id }: { id: string }): Promise<void> => {
    return HttpClient.post<void>(`${API_ENDPOINTS.USERS}/${id}/block`, {});
  },

  /** POST /users/{id}/unblock */
  unblock: ({ id }: { id: string }): Promise<void> => {
    return HttpClient.post<void>(`${API_ENDPOINTS.USERS}/${id}/unblock`, {});
  },

  /** POST /users/{id}/role { role } — replaces make-admin + revoke-admin. */
  changeRole: ({ id, role }: { id: string; role: string }): Promise<void> => {
    return HttpClient.post<void>(`${API_ENDPOINTS.USERS}/${id}/role`, { role });
  },

  // ── Staff (used by A3) ─────────────────────────────────────────────────────

  getMyStaffs: (params: Partial<UserQueryOptions & { shopId: string }>): Promise<UserPaginator> => {
    const { shopId, ...rest } = params;
    return HttpClient.getPaginated<User>(
      shopId
        ? `shops/${shopId}/staff`
        : API_ENDPOINTS.MY_STAFFS,
      rest as CallerPageParams,
    );
  },

  getAllStaffs: (params: Partial<UserQueryOptions>): Promise<UserPaginator> => {
    return HttpClient.getPaginated<User>(API_ENDPOINTS.ALL_STAFFS, params as CallerPageParams);
  },
};

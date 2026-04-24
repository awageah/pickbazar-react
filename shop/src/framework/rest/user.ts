import { useState } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useStateMachine } from 'little-state-machine';

import {
  initialState,
  updateFormState,
} from '@/components/auth/forgot-password';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Routes } from '@/config/routes';
import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import {
  clearAuthCredentials,
  setAuthCredentials,
} from '@/framework/utils/auth-utils';
import {
  getErrorCode,
  getFieldErrors,
  getFormErrors,
} from '@/framework/utils/error-handler';
import {
  NEWSLETTER_POPUP_MODAL_KEY,
  REVIEW_POPUP_MODAL_KEY,
} from '@/lib/constants';
import { useToken } from '@/lib/hooks/use-token';
import { authorizationAtom } from '@/store/authorization-atom';
import { clearCheckoutAtom } from '@/store/checkout';
import type {
  AuthResponse,
  CreateAddressInput,
  ForgotPasswordUserInput,
  LoginUserInput,
  OtpLoginInputType,
  RegisterUserInput,
  ResendVerificationEmailInput,
  ResetPasswordUserInput,
  UpdateAddressInput,
  UpdateProfileInput,
  VerifyForgotPasswordUserInput,
} from '@/types';

/**
 * Source of truth for "is the user logged in?" — checks the `auth_token`
 * cookie. React-Query caches the `/me` response; the 401 interceptor in
 * `http-client.ts` handles forced logouts.
 */
export function useUser() {
  const [isAuthorized] = useAtom(authorizationAtom);

  const { data, isLoading, error, isFetchedAfterMount } = useQuery(
    [API_ENDPOINTS.USERS_ME],
    client.users.me,
    {
      enabled: isAuthorized,
      retry: false,
    },
  );

  return {
    me: data,
    isLoading,
    error,
    isAuthorized,
    isFetchedAfterMount,
    emailVerified: data?.email_verified ?? null,
  };
}

// ─── A1. Register ───────────────────────────────────────────────────────────
export function useRegister() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const [, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal, openModal } = useModalAction();
  const [formError, setFormError] = useState<Record<string, string> | null>(
    null,
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isLoading } = useMutation(client.users.register, {
    onSuccess: (data: AuthResponse) => {
      if (!data?.token) {
        setServerError('error-credential-wrong');
        return;
      }
      setToken(data);
      setAuthCredentials(data);
      setAuthorized(true);
      closeModal();
      // Registration always requires email verification before most actions.
      openModal('FORGOT_VIEW');
      toast.success(t('text-registration-success-verify-email'));
    },
    onError: (err) => {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        setFormError(fieldErrors);
        return;
      }
      const msg = getFormErrors(err);
      if (msg) {
        setServerError(msg);
        return;
      }
      setServerError('error-registration-failed');
    },
  });

  return {
    mutate,
    isLoading,
    formError,
    setFormError,
    serverError,
    setServerError,
  };
}

// ─── A2. Login ──────────────────────────────────────────────────────────────
/**
 * On failure the hook exposes both a normalized message (`serverError`) and
 * the machine-readable `errorCode` so the form can render an
 * `EMAIL_NOT_VERIFIED` / `ACCOUNT_BLOCKED` banner with the correct CTA.
 */
export function useLogin() {
  const [, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useModalAction();
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const { mutate: mutateLogin, isLoading } = useMutation(client.users.login, {
    onSuccess: (data: AuthResponse) => {
      if (!data?.token) {
        setServerError('error-credential-wrong');
        return;
      }
      setToken(data);
      setAuthCredentials(data);
      setAuthorized(true);
      closeModal();
      queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
    },
    onError: (err) => {
      const code = getErrorCode(err);
      const msg = getFormErrors(err);
      setServerError(msg ?? 'error-credential-wrong');
      setErrorCode(code);
    },
  });

  function mutate(input: LoginUserInput) {
    setServerError(null);
    setErrorCode(null);
    // Remember the submitted email so the EMAIL_NOT_VERIFIED banner has the
    // right address to pass to the resend-verification endpoint.
    setUnverifiedEmail(input.email);
    mutateLogin(input);
  }

  return {
    mutate,
    isLoading,
    serverError,
    setServerError,
    errorCode,
    setErrorCode,
    unverifiedEmail,
  };
}

// ─── A8. Logout (client-only) ───────────────────────────────────────────────
/**
 * Kolshi has no server-side logout — the cookie IS the session. We drop the
 * cookie and flush React-Query so the next user doesn't see cached data.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { removeToken } = useToken();
  const [, setAuthorized] = useAtom(authorizationAtom);
  const [, resetCheckout] = useAtom(clearCheckoutAtom);
  const [isLoading, setIsLoading] = useState(false);

  function handleLogout() {
    setIsLoading(true);
    try {
      removeToken();
      clearAuthCredentials();
      // `js-cookie`'s remove is idempotent; these keep popup state tidy.
      if (typeof document !== 'undefined') {
        document.cookie = `${REVIEW_POPUP_MODAL_KEY}=; max-age=0; path=/`;
        document.cookie = `${NEWSLETTER_POPUP_MODAL_KEY}=; max-age=0; path=/`;
      }
      setAuthorized(false);
      // @ts-ignore — `clearCheckoutAtom` is a write-only atom (null setter).
      resetCheckout();
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  }

  return { mutate: handleLogout, isLoading };
}

// ─── A3 / A7 / A5. Email-verification helpers ───────────────────────────────
export function useResendVerificationEmail() {
  const { t } = useTranslation('common');
  const { mutate, isLoading } = useMutation(
    (input: ResendVerificationEmailInput) =>
      client.users.resendVerificationEmail(input),
    {
      onSuccess: () => {
        toast.success(t('PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL'));
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
    },
  );
  return { mutate, isLoading };
}

export function useVerifyEmail() {
  const { t } = useTranslation('common');
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isLoading, isSuccess } = useMutation(
    ({ token }: { token: string }) => client.users.verifyEmail({ token }),
    {
      onSuccess: () => {
        toast.success(t('text-email-verified-successfully'));
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        setServerError(msg ?? 'error-invalid-or-expired-token');
      },
    },
  );

  return { mutate, isLoading, isSuccess, serverError, setServerError };
}

// ─── A5. Forgot-password 3-step flow ────────────────────────────────────────
export function useForgotPassword() {
  const { actions } = useStateMachine({ updateFormState });
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<any>(null);

  const { mutate, isLoading } = useMutation(
    (input: ForgotPasswordUserInput) => client.users.forgotPassword(input),
    {
      onSuccess: (data, variables) => {
        setMessage(data?.message ?? null);
        actions.updateFormState({
          email: variables.email,
          step: 'Token',
        });
      },
      onError: (err) => {
        const fieldErrors = getFieldErrors(err);
        if (fieldErrors) {
          setFormError(fieldErrors);
          return;
        }
        const msg = getFormErrors(err);
        setFormError({ email: msg ?? 'error-something-wrong' });
      },
    },
  );

  return { mutate, isLoading, message, formError, setFormError, setMessage };
}

export function useVerifyForgotPasswordToken() {
  const { actions } = useStateMachine({ updateFormState });
  const [formError, setFormError] = useState<any>(null);

  const { mutate, isLoading } = useMutation(
    (input: VerifyForgotPasswordUserInput) =>
      client.users.verifyForgotPasswordToken(input),
    {
      onSuccess: (data, variables) => {
        if (!data?.valid) {
          setFormError({ token: 'error-invalid-or-expired-token' });
          return;
        }
        actions.updateFormState({
          step: 'Password',
          token: variables.token as string,
        });
      },
      onError: (err) => {
        const fieldErrors = getFieldErrors(err);
        if (fieldErrors) {
          setFormError(fieldErrors);
          return;
        }
        const msg = getFormErrors(err);
        setFormError({ token: msg ?? 'error-invalid-or-expired-token' });
      },
    },
  );

  return { mutate, isLoading, formError, setFormError };
}

export function useResetPassword() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { openModal } = useModalAction();
  const { actions } = useStateMachine({ updateFormState });

  return useMutation(
    (input: ResetPasswordUserInput) => client.users.resetPassword(input),
    {
      onSuccess: () => {
        toast.success(t('text-password-reset-successfully'));
        actions.updateFormState({ ...initialState });
        openModal('LOGIN_VIEW');
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.clear();
      },
    },
  );
}

// ─── B2. Update profile (name + email are NOT editable in Kolshi) ──────────
export function useUpdateProfile() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { closeModal } = useModalAction();

  return useMutation(
    (input: UpdateProfileInput) => client.users.updateProfile(input),
    {
      onSuccess: () => {
        toast.success(t('profile-update-successful'));
        closeModal();
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      },
    },
  );
}

/** Back-compat alias — legacy components still import `useUpdateUser`. */
export const useUpdateUser = useUpdateProfile;

// ─── B3–B8. Address CRUD ────────────────────────────────────────────────────
export function useAddresses() {
  const [isAuthorized] = useAtom(authorizationAtom);
  return useQuery(
    [API_ENDPOINTS.ME_ADDRESSES],
    () => client.users.addresses.all(),
    { enabled: isAuthorized, retry: false },
  );
}

export function useCreateAddress() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { closeModal } = useModalAction();

  return useMutation(
    (input: CreateAddressInput) => client.users.addresses.create(input),
    {
      onSuccess: () => {
        toast.success(t('text-address-saved'));
        closeModal();
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.ME_ADDRESSES]);
        queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      },
    },
  );
}

export function useUpdateAddress() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { closeModal } = useModalAction();

  return useMutation(
    ({
      id,
      input,
    }: {
      id: string | number;
      input: UpdateAddressInput;
    }) => client.users.addresses.update(id, input),
    {
      onSuccess: () => {
        toast.success(t('text-address-updated'));
        closeModal();
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.ME_ADDRESSES]);
        queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      },
    },
  );
}

export function useSetDefaultAddress() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  return useMutation(
    (id: string | number) => client.users.addresses.setDefault(id),
    {
      onSuccess: () => {
        toast.success(t('text-default-address-updated'));
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.ME_ADDRESSES]);
        queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      },
    },
  );
}

export const useDeleteAddress = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  return useMutation(
    ({ id }: { id: string | number }) => client.users.addresses.delete(id),
    {
      onSuccess: () => {
        toast.success(t('successfully-address-deleted'));
        closeModal();
      },
      onError: (err) => {
        const msg = getFormErrors(err);
        toast.error(t(msg ?? 'error-something-wrong'));
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.ME_ADDRESSES]);
        queryClient.invalidateQueries([API_ENDPOINTS.USERS_ME]);
      },
    },
  );
};

// ─── A.3 / A.4 Coming-Soon surface ──────────────────────────────────────────
//
// Decision log — A.6 `useChangePassword`, B.7 `useUpdateEmail`, and L.5
// `useContact` have been removed with their UI surfaces (change-password
// form, profile email card, vendor / super-admin contact forms). Add them
// back once the corresponding Kolshi endpoints exist; the page stubs
// (`/change-password` → redirect to `/profile`, `/contact` → contact
// channels only) remain in place so deep links don't 404.
function comingSoon() {
  toast.error('This feature is coming soon.');
}

export function useSocialLogin() {
  return useMutation(
    async (_input: unknown) => {
      comingSoon();
      return Promise.reject<AuthResponse>(
        new Error('Social login is coming soon.'),
      );
    },
    { retry: false },
  );
}

export function useSendOtpCode(_opts?: { verifyOnly?: boolean }) {
  const [serverError, setServerError] = useState<string | null>(null);
  return {
    mutate: (_input?: unknown) => comingSoon(),
    isLoading: false,
    serverError,
    setServerError,
  };
}

export function useVerifyOtpCode(_opts?: { onVerifySuccess?: Function }) {
  const [serverError, setServerError] = useState<string | null>(null);
  return {
    mutate: (_input?: unknown) => comingSoon(),
    isLoading: false,
    serverError,
    setServerError,
  };
}

export function useOtpLogin() {
  const [serverError, setServerError] = useState<string | null>(null);
  function handleSubmit(_input: OtpLoginInputType) {
    comingSoon();
  }
  return {
    mutate: handleSubmit,
    isLoading: false,
    serverError,
    setServerError,
  };
}

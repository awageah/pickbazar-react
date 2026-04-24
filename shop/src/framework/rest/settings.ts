import type { Settings } from '@/types';
import { useMutation, useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import { getPreviewImage } from '@/lib/get-preview-image';
import { useAtom } from 'jotai';
import { couponAtom } from '@/store/checkout';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { setMaintenanceDetails } from './utils/maintenance-utils';

/**
 * `GET /settings` — public Kolshi settings.
 *
 * `client.settings.all` returns the Pickbazar-shaped envelope
 * (`{ id, name, slug, options }`) whether the backend responded with
 * the flat `{ setting_key, setting_value }` list or the already-
 * wrapped object. Consumers continue to read `settings.<key>` via the
 * returned `settings` dictionary.
 */
export function useSettings() {
  const { locale } = useRouter();

  const formattedOptions = {
    language: locale,
  };

  const { data, isLoading, error, isFetching } = useQuery<Settings, Error>(
    [API_ENDPOINTS.SETTINGS, formattedOptions],
    () => client.settings.all(formattedOptions),
  );
  const { isUnderMaintenance = false, maintenance = {} } = data?.options! ?? {};
  setMaintenanceDetails(isUnderMaintenance, maintenance);
  return {
    settings: data?.options ?? {},
    isLoading,
    error,
    isFetching,
  };
}

/**
 * Kolshi has no multipart upload endpoint. `useUploads` stays as a
 * surface for legacy callers but now toasts "coming soon" and returns
 * the already-displayed preview list untouched. New uploaders must
 * use `useCloudinaryUpload` from `framework/rest/utils/cloudinary.ts`.
 */
export const useUploads = ({ defaultFiles }: any) => {
  const { t } = useTranslation('common');
  const [files] = useState<FileWithPath[]>(getPreviewImage(defaultFiles));

  const { mutate: upload, isLoading } = useMutation(client.settings.upload, {
    onError: () => {
      toast.info(`${t('text-upload-migrated-to-cloudinary')}`);
    },
  });

  function handleSubmit(data: File[]) {
    upload(data);
  }

  return { mutate: handleSubmit, isLoading, files };
};

export function useSubscription() {
  const { t } = useTranslation('common');
  let [isSubscribed, setIsSubscribed] = useState(false);

  const subscription = useMutation(client.users.subscribe, {
    onSuccess: () => {
      setIsSubscribed(true);
    },
    onError: () => {
      setIsSubscribed(false);
      toast.info(`${t('text-newsletter-coming-soon')}`);
    },
  });

  return {
    ...subscription,
    isSubscribed,
  };
}

/**
 * `POST /coupons/validate` — server-side coupon check run from the
 * checkout summary. Returns `{ is_valid, coupon?, discount?, message? }`;
 * we surface `message` as a form error and apply the coupon atom on
 * success so the rest of the UI (discount row, free-shipping pill)
 * re-renders.
 */
export function useVerifyCoupon() {
  const { t } = useTranslation();
  const [_, applyCoupon] = useAtom(couponAtom);
  let [formError, setFormError] = useState<any>(null);

  const { mutate, isLoading } = useMutation(client.coupons.validate, {
    onSuccess: (data: any) => {
      if (!data?.is_valid) {
        setFormError({ code: t(`common:${data?.message ?? 'error-invalid-coupon'}`) });
        return;
      }
      setFormError(null);
      applyCoupon(data?.coupon ?? null);
    },
    onError: (error) => {
      const { response: { data } = {} }: any = error ?? {};
      toast.error(data?.message ?? t('error-invalid-coupon'));
    },
  });

  return { mutate, isLoading, formError, setFormError };
}

/**
 * `POST /coupons/best-match` — optional helper that returns the
 * most valuable coupon the user currently qualifies for. Callers
 * usually render this as a "Use best coupon" button next to the
 * input. Mirrors `useVerifyCoupon` on success/error handling.
 */
export function useBestMatchCoupon() {
  const { t } = useTranslation();
  const [_, applyCoupon] = useAtom(couponAtom);

  return useMutation(client.coupons.bestMatch, {
    onSuccess: (data: any) => {
      if (data?.coupon) applyCoupon(data.coupon);
      else toast.info(t('text-no-matching-coupon'));
    },
    onError: () => {
      toast.info(t('text-no-matching-coupon'));
    },
  });
}

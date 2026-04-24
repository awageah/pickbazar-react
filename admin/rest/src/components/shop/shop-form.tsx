/**
 * A4 — Shop create / edit form adapted to Kolshi.
 *
 * Removed sections (no backend support):
 *   - GooglePlacesAutocomplete (no Google Maps)
 *   - OpenAI description generator
 *   - Balance / payment-info (no commission management in Kolshi shop CRUD)
 *   - Shop maintenance mode
 *   - "Ask for a quote"
 *   - isMultiCommissionRate commission rate
 *
 * Kept: logo, cover_image, name, description, address (country/city/state/zip/
 * street), settings (contact, website, socials), notification email (store-owner only).
 *
 * Image upload: wired through `useUploadMutation` which now calls Cloudinary.
 */
import Card from '@/components/common/card';
import * as socialIcons from '@/components/icons/social';
import { EditIcon } from '@/components/icons/edit';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import { Config } from '@/config';
import { useCreateShopMutation, useUpdateShopMutation } from '@/data/shop';
import {
  IImage,
  Shop,
  ShopSocialInput,
} from '@/types';
import { getAuthCredentials } from '@/utils/auth-utils';
import { STAFF, STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';
import { getFormattedImage } from '@/utils/get-formatted-image';
import { getIcon } from '@/utils/get-icon';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { shopValidationSchema } from './shop-validation-schema';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { socialIcon } from '@/settings/site.settings';
import PhoneNumberInput from '@/components/ui/phone-input';
import * as yup from 'yup';

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex items-center justify-center w-4 h-4">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type FormValues = {
  name: string;
  slug: string;
  description: string;
  cover_image: any;
  logo: any;
  address: {
    country?: string;
    city?: string;
    state?: string;
    zip?: string;
    street_address?: string;
  };
  settings: {
    contact?: string;
    website?: string;
    socials?: Array<{ icon: any; url: string }>;
    notifications?: { email?: string; enable?: boolean };
  };
};

const kolshiShopSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  description: yup.string(),
  settings: yup.object().shape({
    contact: yup.string(),
    website: yup.string().url('form:error-url-invalid'),
  }),
});

const ShopForm = ({ initialValues }: { initialValues?: Shop }) => {
  const { mutate: createShop, isLoading: creating } = useCreateShopMutation();
  const { mutate: updateShop, isLoading: updating } = useUpdateShopMutation();
  const { permissions } = getAuthCredentials();
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<FormValues>({
    shouldUnregister: true,
    ...(initialValues
      ? {
          defaultValues: {
            ...initialValues,
            logo: getFormattedImage(initialValues?.logo as IImage),
            cover_image: getFormattedImage(initialValues?.cover_image as IImage),
            settings: {
              ...initialValues?.settings,
              socials: initialValues?.settings?.socials
                ? initialValues?.settings?.socials.map((social: any) => ({
                    icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
                    url: social?.url,
                  }))
                : [],
            },
          },
        }
      : {}),
    resolver: yupResolver(kolshiShopSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'settings.socials',
  });

  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    (router?.query?.action === 'edit' || router?.pathname === '/[shop]/edit') &&
    router?.locale === Config.defaultLanguage;
  const slugAutoSuggest = formatSlug(watch('name'));

  function extractImageUrl(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    // Cloudinary result shape (from useUploadMutation)
    if (value?.original) return value.original;
    if (value?.thumbnail) return value.thumbnail;
    if (value?.secure_url) return value.secure_url;
    return undefined;
  }

  function onSubmit(values: FormValues) {
    const socials = values?.settings?.socials
      ? values.settings.socials.map((s: any) => ({
          icon: s?.icon?.value ?? s?.icon,
          url: s?.url,
        }))
      : [];

    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      logo: extractImageUrl(values.logo),
      cover_image: extractImageUrl(values.cover_image),
      address: values.address,
      settings: {
        contact: values.settings?.contact,
        website: values.settings?.website,
        socials,
        notifications: values.settings?.notifications,
      },
    };

    if (initialValues) {
      updateShop({ id: initialValues.id as string, ...payload });
    } else {
      createShop(payload as any);
    }
  }

  const coverImageInformation = (
    <span>
      {t('form:shop-cover-image-help-text')} <br />
      {t('form:cover-image-dimension-help-text')}&nbsp;
      <span className="font-bold">1170 x 435{t('common:text-px')}</span>
    </span>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Logo */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={t('form:shop-logo-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="logo" control={control} multiple={false} />
        </Card>
      </div>

      {/* Cover Image */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:shop-cover-image-title')}
          details={coverImageInformation}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="cover_image" control={control} multiple={false} />
        </Card>
      </div>

      {/* Basic Info */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:shop-basic-info')}
          details={t('form:shop-basic-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            variant="outline"
            className="mb-5"
            error={t(errors.name?.message!)}
            required
          />

          {isSlugEditable ? (
            <div className="relative mb-5">
              <Input
                label={t('form:input-label-slug')}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <button
                className="absolute top-[27px] right-px z-0 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                type="button"
                title={t('common:text-edit')}
                onClick={() => setIsSlugDisable(false)}
              >
                <EditIcon width={14} />
              </button>
            </div>
          ) : (
            <Input
              label={t('form:input-label-slug')}
              {...register('slug')}
              value={slugAutoSuggest}
              variant="outline"
              className="mb-5"
              disabled
            />
          )}

          <TextArea
            label={t('form:input-label-description')}
            {...register('description')}
            variant="outline"
            error={t(errors.description?.message!)}
          />
        </Card>
      </div>

      {/* Address */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:shop-address')}
          details={t('form:shop-address-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-country')}
            {...register('address.country')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-city')}
            {...register('address.city')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-state')}
            {...register('address.state')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-zip')}
            {...register('address.zip')}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-street-address')}
            {...register('address.street_address')}
            variant="outline"
          />
        </Card>
      </div>

      {/* Notification email — store-owner only */}
      {permissions?.includes(STORE_OWNER) && (
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={t('form:form-notification-title')}
            details={t('form:form-notification-description')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full mb-5 sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-notification-email')}
              {...register('settings.notifications.email')}
              variant="outline"
              className="mb-5"
              type="email"
            />
            <div className="flex items-center gap-x-4">
              <SwitchInput name="settings.notifications.enable" control={control} />
              <Label className="!mb-0.5">{t('form:input-enable-notification')}</Label>
            </div>
          </Card>
        </div>
      )}

      {/* Shop Settings (contact + website) */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:shop-settings')}
          details={t('form:shop-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <PhoneNumberInput
            label={t('form:input-label-contact')}
            {...register('settings.contact')}
            control={control}
          />
          <Input
            label={t('form:input-label-website')}
            {...register('settings.website')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      {/* Social links */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:social-settings')}
          details={t('form:social-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div>
            {fields?.map((item: ShopSocialInput & { id: string }, index: number) => (
              <div
                className="py-5 border-b border-dashed border-border-200 first:mt-0 first:border-t-0 first:pt-0 last:border-b-0 md:py-8 md:first:mt-0"
                key={item.id}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                  <div className="sm:col-span-2">
                    <Label>{t('form:input-label-select-platform')}</Label>
                    <SelectInput
                      name={`settings.socials.${index}.icon` as const}
                      control={control}
                      options={updatedIcons}
                      isClearable={true}
                      defaultValue={item?.icon!}
                    />
                  </div>
                  <Input
                    className="sm:col-span-2"
                    label={t('form:input-label-url')}
                    variant="outline"
                    {...register(`settings.socials.${index}.url` as const)}
                    defaultValue={item.url!}
                    required
                  />
                  <button
                    onClick={() => remove(index)}
                    type="button"
                    className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                  >
                    {t('form:button-label-remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => append({ icon: '', url: '' })}
            className="w-full text-sm sm:w-auto md:text-base"
          >
            {t('form:button-label-add-social')}
          </Button>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="mb-5 text-end">
          <Button loading={creating || updating} disabled={creating || updating}>
            {initialValues ? t('form:button-label-update') : t('form:button-label-save')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default ShopForm;

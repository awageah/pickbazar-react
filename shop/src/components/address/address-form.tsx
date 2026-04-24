import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Label from '@/components/ui/forms/label';
import Radio from '@/components/ui/forms/radio/radio';
import TextArea from '@/components/ui/forms/text-area';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { AddressType } from '@/framework/utils/constants';
import { useCreateAddress, useUpdateAddress } from '@/framework/user';
import { KolshiAddressType } from '@/types';

type AddressFormValues = {
  title: string;
  address: string;
  type: KolshiAddressType;
  is_default: boolean;
};

/**
 * Kolshi addresses are a flat `{ title, address, type, is_default }` triad —
 * the old country/city/state/zip/street_address grid is gone. Keep this form
 * small and let validation mirror the backend's constraints.
 */
const addressSchema = yup.object().shape({
  title: yup.string().trim().required('error-title-required'),
  address: yup.string().trim().required('error-address-required'),
  type: yup
    .string()
    .oneOf([AddressType.Shipping, AddressType.Billing])
    .required('error-type-required'),
  is_default: yup.boolean(),
});

type InnerProps = {
  onSubmit: (values: AddressFormValues) => void;
  defaultValues: AddressFormValues;
  isLoading?: boolean;
  isEditing?: boolean;
};

export const AddressForm: React.FC<InnerProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  isEditing,
}) => {
  const { t } = useTranslation('common');
  return (
    <Form<AddressFormValues>
      onSubmit={onSubmit}
      className="grid h-full grid-cols-2 gap-5"
      //@ts-ignore — yup + typed Form generic mismatch on optional booleans.
      validationSchema={addressSchema}
      useFormProps={{
        shouldUnregister: true,
        defaultValues,
      }}
      resetValues={defaultValues}
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="col-span-2">
            <Label>{t('text-type')}</Label>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Radio
                id="shipping"
                {...register('type')}
                type="radio"
                value={AddressType.Shipping}
                label={t('text-shipping')}
              />
              <Radio
                id="billing"
                {...register('type')}
                type="radio"
                value={AddressType.Billing}
                label={t('text-billing')}
              />
            </div>
          </div>

          <Input
            label={t('text-title')}
            {...register('title')}
            error={t(errors.title?.message!)}
            variant="outline"
            className="col-span-2"
            placeholder={t('text-address-title-placeholder')}
          />

          <TextArea
            label={t('text-address')}
            {...register('address')}
            error={t(errors.address?.message!)}
            variant="outline"
            className="col-span-2"
            placeholder={t('text-address-placeholder')}
          />

          <label className="col-span-2 flex cursor-pointer items-center gap-2 text-sm text-heading">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 accent-accent"
              {...register('is_default')}
            />
            {t('text-mark-as-default-address')}
          </label>

          <Button
            className="col-span-2 w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? t('text-update') : t('text-save')}{' '}
            {t('text-address')}
          </Button>
        </>
      )}
    </Form>
  );
};

export default function CreateOrUpdateAddressForm() {
  const { t } = useTranslation('common');
  const {
    data: { address, type },
  } = useModalState() as {
    data: {
      address?: {
        id: string | number;
        title: string;
        address: string;
        type: string;
        is_default?: boolean;
      };
      type?: string;
    };
  };
  const { closeModal } = useModalAction();
  const { mutate: createAddress, isLoading: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isLoading: isUpdating } = useUpdateAddress();

  const isEditing = Boolean(address?.id);

  const defaultValues: AddressFormValues = {
    title: address?.title ?? '',
    address: typeof address?.address === 'string' ? address.address : '',
    type: (address?.type as KolshiAddressType) ??
      (type === AddressType.Billing
        ? KolshiAddressType.Billing
        : KolshiAddressType.Shipping),
    is_default: Boolean(address?.is_default),
  };

  function onSubmit(values: AddressFormValues) {
    if (isEditing && address?.id) {
      updateAddress(
        { id: address.id, input: values },
        { onSuccess: () => closeModal() },
      );
    } else {
      createAddress(values, { onSuccess: () => closeModal() });
    }
  }

  return (
    <div className="min-h-screen p-5 bg-light sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-4 text-lg font-semibold text-center text-heading sm:mb-6">
        {isEditing ? t('text-update') : t('text-add-new')}{' '}
        {t('text-address')}
      </h1>
      <AddressForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        isLoading={isCreating || isUpdating}
        isEditing={isEditing}
      />
    </div>
  );
}

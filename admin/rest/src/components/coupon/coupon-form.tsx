import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Radio from '@/components/ui/radio/radio';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Coupon, CouponInput } from '@/types';
import { useCreateCouponMutation, useUpdateCouponMutation } from '@/data/coupon';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '../ui/switch-input';
import DatePicker from '@/components/ui/date-picker';

// ── Validation schema ────────────────────────────────────────────────────────

const couponSchema = yup.object().shape({
  code: yup
    .string()
    .required('form:error-code-required')
    .min(3, 'form:error-code-min')
    .max(50, 'form:error-code-max')
    .matches(/^[A-Z0-9-]+$/, 'form:error-code-pattern'),
  discount_type: yup.string().required('form:error-type-required'),
  discount_value: yup
    .number()
    .typeError('form:error-amount-required')
    .positive('form:error-amount-positive')
    .required('form:error-amount-required'),
  min_order_amount: yup.number().typeError('').min(0).nullable(),
  max_uses: yup.number().typeError('').positive().nullable(),
  per_user_limit: yup.number().typeError('').min(1).nullable(),
  expires_at: yup.string().nullable(),
  is_active: yup.boolean(),
  first_time_user_only: yup.boolean(),
});

// ── Form types ────────────────────────────────────────────────────────────────

type FormValues = {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  description?: string;
  min_order_amount?: number | null;
  max_uses?: number | null;
  per_user_limit?: number | null;
  expires_at?: string | null;
  is_active: boolean;
  first_time_user_only: boolean;
};

type IProps = {
  initialValues?: Coupon;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateOrUpdateCouponForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          code: initialValues.code,
          discount_type: initialValues.discount_type ?? 'FIXED',
          discount_value: initialValues.discount_value ?? 0,
          description: initialValues.description,
          min_order_amount: initialValues.min_order_amount ?? null,
          max_uses: initialValues.max_uses ?? null,
          per_user_limit: initialValues.per_user_limit ?? null,
          expires_at: initialValues.expires_at ?? null,
          is_active: initialValues.is_active ?? true,
          first_time_user_only: initialValues.first_time_user_only ?? false,
        }
      : {
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          is_active: true,
          first_time_user_only: false,
        },
    resolver: yupResolver(couponSchema) as any,
  });

  const discountType = watch('discount_type');

  const { mutate: createCoupon, isLoading: creating } = useCreateCouponMutation();
  const { mutate: updateCoupon, isLoading: updating } = useUpdateCouponMutation();

  const onSubmit = (values: FormValues) => {
    const input: CouponInput = {
      code: values.code,
      discount_type: values.discount_type,
      discount_value: Number(values.discount_value),
      description: values.description,
      min_order_amount: values.min_order_amount
        ? Number(values.min_order_amount)
        : undefined,
      max_uses: values.max_uses ? Number(values.max_uses) : undefined,
      per_user_limit: values.per_user_limit
        ? Number(values.per_user_limit)
        : undefined,
      expires_at: values.expires_at ?? undefined,
      is_active: values.is_active,
      first_time_user_only: values.first_time_user_only,
    };

    if (initialValues) {
      updateCoupon({ id: initialValues.id, ...input });
    } else {
      createCoupon(input);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          }
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {/* ── Code ── */}
          <Input
            label={t('form:input-label-code')}
            {...register('code')}
            error={t(errors.code?.message!)}
            variant="outline"
            className="mb-5"
            required
            disabled={!!initialValues}
            placeholder="SAVE10"
          />

          {/* ── Description ── */}
          <TextArea
            label={t('form:input-label-description')}
            {...register('description')}
            variant="outline"
            className="mb-5"
          />

          {/* ── Discount type ── */}
          <div className="mb-5">
            <Label>{t('form:input-label-type')}</Label>
            <div className="space-y-3.5">
              <Radio
                label={t('form:input-label-percentage')}
                {...register('discount_type')}
                id="percentage"
                value="PERCENTAGE"
                error={t(errors.discount_type?.message!)}
              />
              <Radio
                label={t('form:input-label-fixed')}
                {...register('discount_type')}
                id="fixed"
                value="FIXED"
              />
            </div>
          </div>

          {/* ── Discount value ── */}
          <Input
            label={
              discountType === 'PERCENTAGE'
                ? `${t('form:coupon-input-label-amount')} (%)`
                : t('form:coupon-input-label-amount')
            }
            {...register('discount_value')}
            type="number"
            step="0.01"
            min="0"
            error={t(errors.discount_value?.message!)}
            variant="outline"
            className="mb-5"
            required
          />

          {/* ── Min order amount ── */}
          <Input
            label={t('form:input-label-minimum-cart-amount')}
            {...register('min_order_amount')}
            type="number"
            step="0.01"
            min="0"
            error={t(errors.min_order_amount?.message!)}
            variant="outline"
            className="mb-5"
          />

          {/* ── Max uses ── */}
          <Input
            label={t('form:input-label-max-uses') ?? 'Max Uses'}
            {...register('max_uses')}
            type="number"
            min="1"
            variant="outline"
            className="mb-5"
          />

          {/* ── Per-user limit ── */}
          <Input
            label={t('form:input-label-per-user-limit') ?? 'Per-User Limit'}
            {...register('per_user_limit')}
            type="number"
            min="1"
            variant="outline"
            className="mb-5"
          />

          {/* ── Expiry ── */}
          <DatePicker
            control={control}
            name="expires_at"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            label={t('form:coupon-expire-at')}
            className="border border-border-base mb-5"
          />

          {/* ── Active toggle ── */}
          <div className="mb-5 flex items-center gap-x-4">
            <SwitchInput name="is_active" control={control} />
            <Label className="!mb-0.5">{t('form:input-label-active') ?? 'Active'}</Label>
          </div>

          {/* ── First-time user only ── */}
          <div className="mb-5 flex items-center gap-x-4">
            <SwitchInput name="first_time_user_only" control={control} />
            <Label className="!mb-0.5">
              {t('form:input-label-verified-customer') ?? 'First-time users only'}
            </Label>
          </div>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="me-4"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}
          <Button loading={creating || updating} disabled={creating || updating}>
            {initialValues
              ? t('form:button-label-update-coupon')
              : t('form:button-label-add-coupon')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}

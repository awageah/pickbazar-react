import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useShopQuery } from '@/data/shop';
import { useAddStaffMutation } from '@/data/staff';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

type FormValues = {
  userId: string;
};

const staffFormSchema = yup.object().shape({
  userId: yup
    .string()
    .required('form:error-user-id-required')
    .matches(/^\d+$/, 'form:error-user-id-numeric'),
});

const AddStaffForm = () => {
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { data: shopData } = useShopQuery({ slug: shop as string });
  const shopId = shopData?.id!;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(staffFormSchema),
  });

  const { mutate: addStaff, isLoading: loading } = useAddStaffMutation();
  const { t } = useTranslation();

  function onSubmit({ userId }: FormValues) {
    addStaff({ shopId, userId });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t(
            'form:form-description-staff-info',
            'Enter the ID of an existing registered user to add them as a staff member of this shop.',
          )}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-user-id', 'User ID')}
            {...register('userId')}
            type="text"
            inputMode="numeric"
            variant="outline"
            className="mb-4"
            error={t(errors.userId?.message!)}
            helperText={t(
              'form:helper-text-staff-user-id',
              'The user must already have an account. Find their ID from the Users list.',
            )}
            required
          />
        </Card>
      </div>

      <StickyFooterPanel>
        <div className="text-end">
          <Button
            loading={loading}
            disabled={loading}
            className="text-sm md:text-base"
          >
            {t('form:button-label-add-staff')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default AddStaffForm;

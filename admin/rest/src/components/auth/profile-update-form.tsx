/**
 * B.7 — Profile update (admin's own profile).
 *
 * Kolshi PUT /me/profile accepts: { bio?, contact?, avatar? }
 *   - `name` is managed by support (no self-service rename endpoint).
 *   - Email update is fully removed (no self-service email change in Kolshi).
 *   - Per-user notification settings are not in Kolshi; section removed.
 *   - Avatar upload wired to Cloudinary in A8.
 */
import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useUpdateProfileMutation } from '@/data/user';
import TextArea from '@/components/ui/text-area';
import { useTranslation } from 'next-i18next';
import PhoneNumberInput from '@/components/ui/phone-input';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type FormValues = {
  bio: string;
  contact: string;
};

const profileSchema = yup.object().shape({
  bio: yup.string().max(500, 'form:error-bio-max'),
  contact: yup.string(),
});

export default function ProfileUpdate({ me }: any) {
  const { t } = useTranslation();
  const { mutate: updateProfile, isLoading: loading } =
    useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      bio: me?.profile?.bio ?? '',
      contact: me?.profile?.contact ?? '',
    },
  });

  async function onSubmit({ bio, contact }: FormValues) {
    updateProfile({ bio, contact });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:profile-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full mb-5 sm:w-8/12 md:w-2/3">
          <TextArea
            label={t('form:input-label-bio')}
            {...register('bio')}
            error={t(errors.bio?.message!)}
            variant="outline"
            className="mb-6"
          />
          <PhoneNumberInput
            label={t('form:input-label-contact')}
            {...register('contact')}
            control={control}
            error={t(errors.contact?.message!)}
          />
        </Card>

        <div className="w-full text-end">
          <Button loading={loading} disabled={loading}>
            {t('form:button-label-save')}
          </Button>
        </div>
      </div>
    </form>
  );
}

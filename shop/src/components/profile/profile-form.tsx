import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import pick from 'lodash/pick';
import Button from '@/components/ui/button';
import Card from '@/components/ui/cards/card';
import Input from '@/components/ui/forms/input';
import TextArea from '@/components/ui/forms/text-area';
import { Form } from '@/components/ui/forms/form';
import { useUpdateProfile } from '@/framework/user';
import { uploadFilesToCloudinary } from '@/framework/utils/cloudinary';
import type { UpdateProfileInput, User } from '@/types';

type ProfileFormValues = {
  name: string;
  email: string;
  profile: {
    bio?: string;
    contact?: string;
    avatar?: string;
  };
};

const AVATAR_CLOUDINARY_FOLDER = 'kolshi/avatars';

/**
 * Kolshi's `PUT /me/profile` accepts `{ avatar, bio, contact }` only — `name`
 * and `email` are immutable from the shop UI (see decision log §B.1/§B.7).
 * We still surface those fields as **disabled** so the user can see what's on
 * record, but we never send them to the backend.
 */
const ProfileForm = ({ user }: { user: User }) => {
  const { t } = useTranslation('common');
  const { mutate: updateProfile, isLoading } = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    typeof user?.profile?.avatar === 'string'
      ? user.profile.avatar
      : (user?.profile?.avatar as any)?.thumbnail ??
          (user?.profile?.avatar as any)?.original ??
          undefined,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const [result] = await uploadFilesToCloudinary([file], {
        folder: AVATAR_CLOUDINARY_FOLDER,
      });
      setAvatarUrl(result.secure_url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setIsUploading(false);
      // Reset so the user can re-upload the same file if they want to retry.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function onSubmit(values: ProfileFormValues) {
    const input: UpdateProfileInput = {
      avatar: avatarUrl ?? null,
      bio: values.profile?.bio ?? null,
      contact: values.profile?.contact ?? null,
    };
    updateProfile(input);
  }

  return (
    <Form<ProfileFormValues>
      onSubmit={onSubmit}
      useFormProps={{
        defaultValues: {
          ...pick(user, ['name', 'email']),
          profile: {
            bio: user?.profile?.bio ?? '',
            contact: user?.profile?.contact ?? '',
          },
        },
      }}
    >
      {({ register }) => (
        <div className="mb-8 flex">
          <Card className="w-full">
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-body-dark">
                {t('text-avatar')}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border-200 bg-gray-100">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user?.name ?? ''}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-400">
                      {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarSelected}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    loading={isUploading}
                    disabled={isUploading}
                  >
                    {avatarUrl ? t('text-change') : t('text-upload')}
                  </Button>
                  {avatarUrl && !isUploading && (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 hover:underline"
                      onClick={() => setAvatarUrl(undefined)}
                    >
                      {t('text-remove')}
                    </button>
                  )}
                  {uploadError ? (
                    <span className="mt-2 text-xs text-red-500">
                      {uploadError}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Name & email are locked — Kolshi has no self-service endpoint. */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('text-name')}
                {...register('name')}
                variant="outline"
                disabled
              />
              <Input
                label={t('text-email')}
                type="email"
                {...register('email')}
                variant="outline"
                disabled
              />
            </div>

            <Input
              label={t('text-contact-number')}
              {...register('profile.contact')}
              variant="outline"
              className="mb-6"
              placeholder="+962790000000"
            />

            <TextArea
              label={t('text-bio')}
              {...register('profile.bio')}
              variant="outline"
              className="mb-6"
            />

            <div className="flex">
              <Button
                className="ltr:ml-auto rtl:mr-auto"
                loading={isLoading}
                disabled={isLoading || isUploading}
              >
                {t('text-save')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Form>
  );
};

export default ProfileForm;

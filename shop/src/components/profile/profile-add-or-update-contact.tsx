import { useTranslation } from 'next-i18next';

/**
 * `A.4 Coming Soon` — Contact-number update used to flow through an OTP
 * verification modal. The OTP plumbing is dormant in Kolshi S2, so this
 * component is a no-op placeholder retained only because
 * `managed-modal.tsx` still registers the `ADD_OR_UPDATE_PROFILE_CONTACT`
 * view id. The view is never opened from the S2 profile UI.
 */
const ProfileAddOrUpdateContact = () => {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-screen flex-col justify-center bg-light p-5 sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-3 text-center text-sm font-semibold text-heading">
        {t('text-contact-number')}
      </h1>
      <p className="text-center text-sm text-sub-heading">
        {t('text-feature-coming-soon')}
      </p>
    </div>
  );
};

export default ProfileAddOrUpdateContact;

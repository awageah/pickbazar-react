import Card from '@/components/ui/cards/card';
import { useTranslation } from 'next-i18next';
import ProfileAddressGrid from '@/components/profile/profile-address';
import ProfileForm from '@/components/profile/profile-form';
import Seo from '@/components/seo/seo';
import { useUser } from '@/framework/user';
import DashboardLayout from '@/layouts/_dashboard';

export { getStaticProps } from '@/framework/general.ssr';

/**
 * Profile root page. Kolshi keeps only:
 *  - Avatar / bio / contact (`PUT /me/profile`)
 *  - Addresses (`/me/addresses` CRUD, see §B3–B8)
 *
 * The legacy email-change card and OTP-based contact verification card are
 * intentionally not mounted — both features are Hidden per the decision log
 * (§B.7 and §A.4 respectively).
 */
const ProfilePage = () => {
  const { t } = useTranslation('common');
  const { me } = useUser();
  if (!me) return null;

  const addresses = me.addresses ?? me.address ?? [];

  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="w-full overflow-hidden px-1 pb-1">
        <div className="mb-8">
          <ProfileForm user={me} />
        </div>

        <Card className="w-full">
          <ProfileAddressGrid
            userId={String(me.id)}
            addresses={addresses}
            label={t('text-addresses')}
          />
        </Card>
      </div>
    </>
  );
};

ProfilePage.authenticationRequired = true;

ProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProfilePage;

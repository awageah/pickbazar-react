/**
 * Vendor coupon management is not supported in Kolshi Phase 1.
 * Only super_admin can create and manage coupons.
 * This page is a placeholder stub kept so the sidebar link resolves cleanly.
 */
import Layout from '@/components/layouts/shop';
import Card from '@/components/common/card';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';

export default function ShopCoupons() {
  const { t } = useTranslation();
  return (
    <Card className="flex min-h-[300px] flex-col items-center justify-center">
      <h2 className="mb-3 text-xl font-semibold text-heading">
        {t('common:text-coming-soon') ?? 'Coming Soon'}
      </h2>
      <p className="max-w-sm text-center text-sm text-body">
        Vendor-specific coupons are planned for a future phase.
        Platform-wide coupons are managed by the super-admin.
      </p>
    </Card>
  );
}

ShopCoupons.authenticate = { permissions: adminOwnerAndStaffOnly };
ShopCoupons.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});

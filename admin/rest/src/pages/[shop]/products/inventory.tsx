import Card from '@/components/common/card';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import Search from '@/components/common/search';
import { useProductsQuery } from '@/data/product';
import { useRouter } from 'next/router';
import ProductInventoryList from '@/components/product/product-inventory-list';
import { useMeQuery } from '@/data/user';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useShopQuery } from '@/data/shop';
import ShopLayout from '@/components/layouts/shop';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';

export default function VendorProductInventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const { query: { shop } } = useRouter();
  const { data: shopData, isLoading: fetchingShop } = useShopQuery({
    slug: shop as string,
  });
  const shopId = shopData?.id!;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { products, paginatorInfo, loading, error } = useProductsQuery({
    name: searchTerm,
    limit: 20,
    page,
    shop_id: shopId,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (
    !hasAccess(adminOnly, permissions) &&
    !me?.shops?.map((s) => s.id).includes(shopId) &&
    me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('form:input-label-products')} />
          </div>
          <div className="flex w-full flex-col items-center ms-auto md:w-2/4">
            <Search
              onSearch={({ searchText }) => {
                setSearchTerm(searchText);
                setPage(1);
              }}
              placeholderText={t('form:input-placeholder-search-name')}
            />
          </div>
        </div>
      </Card>

      <ProductInventoryList
        products={products}
        paginatorInfo={paginatorInfo}
        onPagination={setPage}
        onOrder={() => {}}
        onSort={() => {}}
      />
    </>
  );
}

VendorProductInventoryPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorProductInventoryPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

import Card from '@/components/common/card';
import Search from '@/components/common/search';
import OrderList from '@/components/order/order-list';
import { LIMIT } from '@/utils/constants';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import { useRouter } from 'next/router';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { useOrdersQuery } from '@/data/order';
import { useShopQuery } from '@/data/shop';
import PageHeading from '@/components/common/page-heading';

export default function Orders() {
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: shopData, isLoading: fetchingShop } = useShopQuery({
    slug: shop as string,
  });
  const shopId = shopData?.id;

  const { orders, loading, paginatorInfo, error } = useOrdersQuery(
    {
      limit: LIMIT,
      page,
      tracking_number: searchTerm,
      shop_id: shopId as any,
    },
    { enabled: Boolean(shopId) },
  );

  if (loading || fetchingShop) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error?.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('form:input-label-orders')} />
        </div>
        <div className="flex w-full flex-col items-center ms-auto md:w-1/2 md:flex-row">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-tracking-number')}
          />
        </div>
      </Card>

      <OrderList
        orders={orders}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
      />
    </>
  );
}

Orders.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
Orders.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

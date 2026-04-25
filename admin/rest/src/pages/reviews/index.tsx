import ReviewList from '@/components/reviews/review-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReviewsQuery } from '@/data/review';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';

export default function Reviews() {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const { reviews, paginatorInfo, loading, error } = useReviewsQuery({
    limit: 15,
    page,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full items-center">
          <PageHeading title={t('form:input-label-reviews')} />
        </div>
      </Card>
      <ReviewList
        reviews={reviews}
        paginatorInfo={paginatorInfo}
        onPagination={setPage}
      />
    </>
  );
}

Reviews.authenticate = { permissions: adminOnly };
Reviews.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

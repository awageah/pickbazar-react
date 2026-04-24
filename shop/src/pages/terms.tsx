import Seo from '@/components/seo/seo';
import { useTranslation } from 'next-i18next';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageBanner from '@/components/banners/page-banner';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import { Link, Element } from 'react-scroll';
import { termsAndServices } from '@/framework/static/terms';

/**
 * Kolshi S6 — terms & conditions page.
 *
 * Kolshi has no terms CMS (decision log L.3 Hide — keep the page as a
 * static MDX-equivalent). The page renders `framework/static/terms.ts`
 * through the `terms` i18n namespace so localised copy can live in
 * translation files. Swap `termsAndServices.content` entries to edit.
 */
const makeTitleToDOMId = (title: string) =>
  title.toLowerCase().split(' ').join('_');

export default function TermsPage() {
  const { t } = useTranslation('terms');
  const { title, date, content } = termsAndServices;

  return (
    <>
      <Seo title="Terms" url="terms" />
      <section className="mx-auto w-full max-w-1920 bg-light pb-8 lg:pb-10 xl:pb-14">
        <PageBanner
          title={t(title) as unknown as string}
          breadcrumbTitle={t('text-home')}
        />
        <div className="mx-auto w-full max-w-screen-lg px-4 py-10">
          <p className="mb-10 px-0.5 text-sm text-body-dark md:text-base 2xl:text-lg">
            {date}
          </p>
          <div className="flex flex-col md:flex-row">
            <nav className="mb-8 hidden md:mb-0 md:block md:w-60 lg:w-72 xl:w-80">
              <ol className="sticky z-10 md:top-28 lg:top-24">
                {content.map((item) => (
                  <li key={item.id}>
                    <Link
                      spy={true}
                      offset={0}
                      smooth={true}
                      duration={500}
                      to={makeTitleToDOMId(item.title)}
                      activeClass="text-sm lg:text-base !text-accent font-semibold relative before:absolute before:h-full before:w-0.5 before:top-0.5 before:left-0 before:bg-accent"
                      className="my-3 inline-flex cursor-pointer pl-4 text-sub-heading"
                    >
                      {t(item.title)}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="md:w-9/12 md:pb-10 ltr:md:pl-8 rtl:md:pr-8">
              {content.map((item) => (
                <Element
                  key={item.id}
                  name={makeTitleToDOMId(item.title)}
                  className="mb-7 md:mb-10"
                >
                  <h2 className="mb-4 text-lg font-bold text-heading md:text-xl lg:text-2xl">
                    {t(item.title)}
                  </h2>
                  <div
                    className="leading-loose text-body-dark"
                    dangerouslySetInnerHTML={{
                      __html: t(item.description) as unknown as string,
                    }}
                  />
                </Element>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

TermsPage.getLayout = getLayoutWithFooter;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'terms'])),
    },
  };
};

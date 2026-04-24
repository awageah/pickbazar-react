import Seo from '@/components/seo/seo';
import { useTranslation } from 'next-i18next';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import PageBanner from '@/components/banners/page-banner';
import Accordion from '@/components/ui/accordion';
import { faq } from '@/framework/static/faq';

/**
 * Kolshi S6 — help / FAQ page.
 *
 * Kolshi has no FAQ API (decision log L.1 Delete). The page now renders
 * a hand-maintained list from `framework/static/faq.ts`, translated via
 * the `faq` i18n namespace so content can be localised without a code
 * change. To add an FAQ, edit `framework/static/faq.ts` and the matching
 * locale JSON.
 */
export default function HelpPage() {
  const { t } = useTranslation();

  const items = faq.map(({ title, content }) => ({
    title,
    content,
  }));

  return (
    <>
      <Seo title="Help" url="help" />
      <section className="w-full min-h-screen pb-16 mx-auto max-w-1920 bg-light lg:pb-10 xl:pb-14">
        <PageBanner
          title={t('text-faq-title')}
          breadcrumbTitle={t('text-home')}
        />
        <div className="w-full max-w-screen-lg px-4 py-10 mx-auto">
          <Accordion items={items} translatorNS="faq" />
        </div>
      </section>
    </>
  );
}

HelpPage.getLayout = getLayoutWithFooter;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'faq'])),
    },
  };
};

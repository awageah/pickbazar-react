import useLayout from '@/lib/hooks/use-layout';
import Header from './header';
import HeaderMinimal from './header-minimal';
import Footer from '../icons/check-icon';
import dynamic from 'next/dynamic';

const MobileNavigation = dynamic(() => import('./mobile-navigation'), {
  ssr: false,
});

/**
 * Kolshi S6 — `NoticeHighlightedBar` (store-notice highlighted banner) is
 * removed alongside the rest of the per-shop notices surface (decision
 * log L.5 Delete). Kolshi has no `/store-notices` endpoint, so the
 * banner would never render; dropping the component also removes the
 * dependency on `framework/rest/store-notices.ts`.
 */
export default function SiteLayout({ children }: React.PropsWithChildren<{}>) {
  const { layout } = useLayout();
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150">
      {['minimal', 'compact'].includes(layout) ? (
        <HeaderMinimal layout={layout} />
      ) : (
        <Header layout={layout} />
      )}
      {children}
      {['compact'].includes(layout) && <Footer />}
      <MobileNavigation />
    </div>
  );
}
export const getLayout = (page: React.ReactElement) => (
  <SiteLayout>{page}</SiteLayout>
);

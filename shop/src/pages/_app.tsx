import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import '@/assets/css/main.css';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/components/ui/modal/modal.context';
import ManagedModal from '@/components/ui/modal/managed-modal';
import ManagedDrawer from '@/components/ui/drawer/managed-drawer';
import DefaultSeo from '@/components/seo/default-seo';
import { SearchProvider } from '@/components/ui/search/search.context';
import PrivateRoute from '@/lib/private-route';
import { CartProvider } from '@/store/quick-cart/cart.context';
import { NextPageWithLayout } from '@/types';
import QueryProvider from '@/framework/client/query-provider';
import { getDirection } from '@/lib/constants';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const ToastContainer = dynamic(
  () => import('react-toastify').then((module) => module.ToastContainer),
  { ssr: false },
);
import Maintenance from '@/components/maintenance/layout';
import { NotificationProvider } from '@/context/notify-content';
import { useLogoutOnUnauthorized } from '@/lib/hooks/use-logout-on-401';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

/**
 * Thin wrapper that mounts the logout-on-401 listener inside the
 * `QueryClientProvider` (required because `useQueryClient` reads context).
 */
function AuthLifecycle({ children }: { children: React.ReactNode }) {
  useLogoutOnUnauthorized();
  return <>{children}</>;
}

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const authenticationRequired = Component.authenticationRequired ?? false;
  const { locale } = useRouter();
  const dir = getDirection(locale);
  return (
    <div dir={dir}>
      <QueryProvider pageProps={pageProps}>
        <AuthLifecycle>
          <SearchProvider>
            <ModalProvider>
              <CartProvider>
                <>
                  <DefaultSeo />
                  <Maintenance>
                    <NotificationProvider>
                      {authenticationRequired ? (
                        <PrivateRoute>
                          {getLayout(<Component {...pageProps} />)}
                        </PrivateRoute>
                      ) : (
                        getLayout(<Component {...pageProps} />)
                      )}
                    </NotificationProvider>
                  </Maintenance>
                  <ManagedModal />
                  <ManagedDrawer />
                  <ToastContainer autoClose={2000} theme="colored" />
                </>
              </CartProvider>
            </ModalProvider>
          </SearchProvider>
        </AuthLifecycle>
      </QueryProvider>
    </div>
  );
}

export default appWithTranslation(CustomApp);

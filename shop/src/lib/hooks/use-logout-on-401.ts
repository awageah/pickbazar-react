import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import Router from 'next/router';

/**
 * Clears the React-Query cache after a forced logout.
 *
 * The axios 401 interceptor cannot touch the `QueryClient` directly (axios
 * has no access to the React tree). Instead, the interceptor redirects the
 * user to `Routes.home`, which fires `routeChangeComplete`; we listen for
 * that event and wipe cached data to avoid any stale-data leak to the next
 * user on a shared machine.
 *
 * Mount once at the top of `_app.tsx`.
 */
export function useLogoutOnUnauthorized(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => queryClient.clear();
    Router.events.on('routeChangeComplete', handler);
    return () => {
      Router.events.off('routeChangeComplete', handler);
    };
  }, [queryClient]);
}

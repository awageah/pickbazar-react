import Link from '@/components/ui/link';
import { siteSettings } from '@/config/site';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useLogout } from '@/framework/user';

type DashboardSidebarProps = {
  className?: string;
};

/**
 * Kolshi has no wallet / loyalty-points feature yet, so the template's
 * points card is dropped. The menu itself is driven by `siteSettings` —
 * feature gating used to filter items inline (Stripe cards, notifications
 * toggle); those features are out of scope for S2 so the filter is gone too.
 */
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  const { mutate: logout } = useLogout();
  const { t } = useTranslation();
  const { pathname } = useRouter();

  const menuItems = siteSettings.dashboardSidebarMenu?.slice(0, -1) ?? [];

  return (
    <aside className={className}>
      <div className="overflow-hidden rounded border border-border-200 bg-light">
        <ul className="py-7">
          {menuItems.map((item, idx) => (
            <li className="py-1" key={idx}>
              <Link
                href={item.href}
                className={classNames(
                  'block border-l-4 border-transparent py-2 px-10 font-semibold text-heading transition-colors hover:text-accent focus:text-accent',
                  {
                    '!border-accent text-accent': pathname === item.href,
                  },
                )}
              >
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="border-t border-border-200 bg-light py-4">
          <li className="block py-2 px-11">
            <button
              onClick={() => logout()}
              className={classNames(
                'font-semibold text-heading transition-colors hover:text-accent focus:text-accent',
              )}
            >
              {t('profile-sidebar-logout')}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

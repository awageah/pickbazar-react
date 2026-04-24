/**
 * Header notification bell — Kolshi M.3.
 *
 * The unread indicator combines two signals:
 *   1. `/notifications/count` (server, rolling 30-day count) gives the
 *      ceiling — any count > 0 means there's at least one notification
 *      to look at.
 *   2. The client-side read set filters previously-read items out of
 *      the dot. If the user has opened every currently-cached item,
 *      the dot disappears even when the server count is > 0 (e.g.
 *      notifications older than the current page window).
 *
 * "Mark all as read" simply marks every currently-cached notification
 * as read locally; Kolshi has no server endpoint for this (see
 * `useNotifyLogAllRead`).
 */
import { NotificationIcon } from '@/components/icons/notification';
import NotificationLists from '@/components/notifications/notification-lists';
import Link from '@/components/ui/link';
import NotifyHeaderContentLoader from '@/components/ui/loaders/notify-header-content';
import { MenuBox } from '@/components/ui/menu';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Scrollbar from '@/components/ui/scrollbar';
import { Routes } from '@/config/routes';
import { useNotification } from '@/context/notify-content';
import {
  useNotificationCount,
  useNotifyLogAllRead,
} from '@/framework/notify-logs';
import { RESPONSIVE_WIDTH } from '@/lib/constants';
import rangeMap from '@/lib/range-map';
import { NotifyLogs } from '@/types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { twMerge } from 'tailwind-merge';

interface HeaderNotificationProps {
  isEnable: boolean;
  isAuthorize: boolean;
}

const HeaderNotification: React.FC<HeaderNotificationProps> = ({
  isAuthorize,
  isEnable,
}) => {
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const handleLogin = useCallback(() => {
    return openModal('LOGIN_VIEW');
  }, []);
  const data = useNotification();

  const notifications = useMemo(() => {
    return data?.notifyLogs;
  }, [data?.notifyLogs]);

  const unReadNotification = useMemo(() => {
    return (notifications ?? []).filter(
      (item: NotifyLogs) => !Boolean(item?.is_read),
    );
  }, [notifications]);

  const { count: serverUnreadCount } = useNotificationCount();
  const hasUnread =
    unReadNotification.length > 0 || serverUnreadCount > 0;

  const { width } = useWindowSize();

  const { mutate: readAllNotifyLogs, isLoading: creating } =
    useNotifyLogAllRead();

  const markAllAsRead = useCallback(() => {
    // Kolshi has no server "mark all as read" endpoint — the hook
    // flips the local read set in-memory and persists it in localStorage.
    readAllNotifyLogs();
  }, [readAllNotifyLogs]);

  return isEnable ? (
    isAuthorize ? (
      width >= RESPONSIVE_WIDTH ? (
        <MenuBox
          Icon={NotificationIcon}
          iconClassName={
            hasUnread
              ? 'before:absolute before:top-0 before:right-0 before:h-2 before:w-2 before:rounded-full before:bg-accent'
              : ''
          }
        >
          <div className="rounded-tl-lg rounded-tr-lg">
            <div
              className={classNames(
                'font-medium px-4 py-4 border-b border-gray-200/80 text-sm',
                !isEmpty(notifications)
                  ? 'flex items-center justify-between'
                  : '',
              )}
            >
              <span>{t('profile-sidebar-notifications')}</span>
              {!isEmpty(unReadNotification) ? (
                <span
                  onClick={markAllAsRead}
                  className="cursor-pointer text-accent hover:text-heading"
                  title={t('text-mark-as-all-read')}
                >
                  {t('text-mark-as-all-read')}
                </span>
              ) : (
                ''
              )}
            </div>
            {data?.isLoading || creating ? (
              <div className="flex flex-col gap-3">
                {rangeMap(3, (i) => (
                  <div
                    className="border-b border-dashed border-gray-200 px-4 py-5"
                    key={i}
                  >
                    <NotifyHeaderContentLoader
                      uniqueKey={`notify-${i}`}
                      className="w-full h-[1.125rem]"
                    />
                  </div>
                ))}
                <div
                  className="px-4 py-5 border-t border-gray-200/80"
                  title={t('text-see-all-notifications')}
                >
                  <NotifyHeaderContentLoader className="w-full h-[1.125rem]" />
                </div>
              </div>
            ) : !isEmpty(notifications) ? (
              <>
                <div className="h-56 max-h-56 min-h-40">
                  <Scrollbar
                    className="h-full w-full"
                    options={{
                      scrollbars: {
                        autoHide: 'never',
                      },
                    }}
                  >
                    <NotificationLists
                      notifications={notifications as NotifyLogs[]}
                    />
                  </Scrollbar>
                </div>
                <Link
                  href={Routes?.notifyLogs}
                  className="block border-t border-gray-200/80 p-3 text-center text-sm font-medium text-accent hover:text-accent-hover"
                  title={t('text-see-all-notifications')}
                >
                  {t('text-see-all-notifications')}
                </Link>
              </>
            ) : (
              <p className="mb-2 pt-5 pb-4 text-center text-sm font-medium text-gray-500">
                {t('text-notification-not-found')}
              </p>
            )}
          </div>
        </MenuBox>
      ) : (
        <Link
          href={Routes?.notifyLogs}
          title={t('text-check-all-notifications')}
          className={twMerge(
            classNames(
              'h-[2.375rem] relative w-[2.375rem] rounded-full border border-border-200 bg-light p-1 text-xl flex',
              hasUnread
                ? 'before:absolute before:top-0 before:right-0 before:h-2 before:w-2 before:rounded-full before:bg-accent'
                : '',
            ),
          )}
        >
          <NotificationIcon className="m-auto" />
        </Link>
      )
    ) : (
      <div
        onClick={handleLogin}
        title={t('text-check-all-notifications')}
        className="h-[2.375rem] w-[2.375rem] cursor-pointer rounded-full border border-border-200 bg-light p-1 text-xl flex"
      >
        <NotificationIcon className="m-auto" />
      </div>
    )
  ) : (
    ''
  );
};

export default HeaderNotification;

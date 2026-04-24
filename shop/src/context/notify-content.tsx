/**
 * Notification context — Kolshi M.3.
 *
 * Binds the shared notification query once per authenticated session
 * so the header bell and the notifications page share the same
 * paginated cache. Sorting is server-side (Kolshi returns newest
 * first by default), so legacy `orderBy` / `sortedBy` parameters are
 * dropped.
 */
import { useNotifyLogs } from '@/framework/notify-logs';
import { NotifyLogs } from '@/types';
import React, { createContext, useContext } from 'react';

type NotificationProps = {
  notifyLogs: NotifyLogs[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: any;
  loadMore: () => void;
};

export const NotificationContext = createContext<NotificationProps | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { notifyLogs, isLoading, isLoadingMore, hasMore, error, loadMore } =
    useNotifyLogs({
      limit: 7,
    });

  // Return the context provider component with the query client and the notification query data
  return (
    <NotificationContext.Provider
      value={{
        // @ts-ignore
        notifyLogs,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Create a custom hook that consumes the notification context
export const useNotification = () => {
  const notification = useContext(NotificationContext);
  if (notification === undefined) {
    throw new Error(
      `useNotification must be used within a NotificationProvider`,
    );
  }
  return notification;
};

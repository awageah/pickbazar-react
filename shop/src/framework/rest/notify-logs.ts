/**
 * Notification hooks — Kolshi M.3.
 *
 * Backing endpoints:
 *   - `GET /notifications`        — paginated list, newest first
 *   - `GET /notifications/{id}`   — single record
 *   - `GET /notifications/count`  — `{ count }` (last 30 days)
 *
 * The Kolshi backend has **no mark-as-read endpoint**. Read state is
 * tracked client-side via a per-user set in `localStorage`; the set is
 * exposed through `useNotificationReadStore` and merged into each
 * notification on read so the existing `is_read` UI keeps working.
 *
 * Display-side adaptation:
 *   - `body || subject` → `notify_text`
 *   - `createdAt`       → `created_at`
 *   - `recipientId`     → `receiver`
 *
 * `enableEmailForDigitalProduct` is no longer used as a gate — the
 * notification panel is always available to authenticated users (it's
 * cheap to render, and the Kolshi list endpoint is idempotent). The
 * setting remains on the Settings DTO for future email-template
 * toggles.
 */
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import type {
  KolshiNotificationCount,
  NotifyLogs,
  NotifyLogsPaginator,
  NotifyLogsQueryOptions,
} from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { useUser } from '@/framework/user';

const READ_STORE_PREFIX = 'kolshi.notifications.read.';

/** Returns the per-user storage key for the local "already-read" set. */
function readStoreKey(userId: string | number | undefined | null) {
  return `${READ_STORE_PREFIX}${userId ?? 'anonymous'}`;
}

function loadReadSet(userId: string | number | undefined | null): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(readStoreKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadSet(
  userId: string | number | undefined | null,
  set: Set<string>,
) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      readStoreKey(userId),
      JSON.stringify(Array.from(set)),
    );
  } catch {
    /* storage full or blocked — silently ignore */
  }
}

/**
 * Subscribes a component to the per-user read-notification set.
 *
 * Returns the live set plus mutators (`markRead`, `markAllRead`) that
 * persist to localStorage and broadcast to other hook instances
 * mounted in the same tab via a CustomEvent. Cross-tab sync is
 * handled automatically by the `storage` event.
 */
export function useNotificationReadStore() {
  const { me } = useUser();
  const userId = (me as any)?.id;
  const [readSet, setReadSet] = useState<Set<string>>(() =>
    loadReadSet(userId),
  );

  useEffect(() => {
    setReadSet(loadReadSet(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: StorageEvent) => {
      if (event.key === readStoreKey(userId)) {
        setReadSet(loadReadSet(userId));
      }
    };
    const localHandler = (event: Event) => {
      const custom = event as CustomEvent<{ userId?: string | number | null }>;
      if (String(custom.detail?.userId ?? '') === String(userId ?? '')) {
        setReadSet(loadReadSet(userId));
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('kolshi:notifications:read', localHandler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(
        'kolshi:notifications:read',
        localHandler,
      );
    };
  }, [userId]);

  const markRead = useCallback(
    (id: string | number) => {
      setReadSet((prev) => {
        if (prev.has(String(id))) return prev;
        const next = new Set(prev);
        next.add(String(id));
        persistReadSet(userId, next);
        window.dispatchEvent(
          new CustomEvent('kolshi:notifications:read', {
            detail: { userId },
          }),
        );
        return next;
      });
    },
    [userId],
  );

  const markAllRead = useCallback(
    (ids: Array<string | number>) => {
      setReadSet((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const id of ids) {
          if (!next.has(String(id))) {
            next.add(String(id));
            changed = true;
          }
        }
        if (!changed) return prev;
        persistReadSet(userId, next);
        window.dispatchEvent(
          new CustomEvent('kolshi:notifications:read', {
            detail: { userId },
          }),
        );
        return next;
      });
    },
    [userId],
  );

  return { readSet, markRead, markAllRead };
}

/**
 * Hydrates a Kolshi notification into the legacy UI shape.
 */
function adaptNotification(
  raw: NotifyLogs,
  readSet: Set<string>,
): NotifyLogs {
  const id = String(raw.id);
  const createdAt = raw.createdAt ?? raw.created_at;
  return {
    ...raw,
    id: raw.id,
    notify_text: raw.notify_text ?? raw.body ?? raw.subject ?? '',
    notify_type: raw.notify_type ?? raw.type,
    receiver: raw.receiver ?? (raw.recipientId ? String(raw.recipientId) : undefined),
    is_read: raw.is_read ?? readSet.has(id),
    created_at: createdAt ?? new Date().toISOString(),
  };
}

export function useNotifyLogs(options?: Partial<NotifyLogsQueryOptions>) {
  const { isAuthorized } = useUser();
  const { readSet } = useNotificationReadStore();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<NotifyLogsPaginator, Error>(
    [API_ENDPOINTS.NOTIFY_LOGS, options ?? {}],
    ({ queryKey, pageParam }) =>
      client.notifyLogs.all(
        Object.assign({}, queryKey[1] as NotifyLogsQueryOptions, pageParam),
      ),
    {
      enabled: isAuthorized,
      retry: false,
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
      refetchOnWindowFocus: false,
    },
  );

  const notifyLogs = useMemo(
    () =>
      (data?.pages?.flatMap((page) => page.data) ?? []).map((n) =>
        adaptNotification(n, readSet),
      ),
    [data, readSet],
  );

  return {
    notifyLogs,
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: () => fetchNextPage(),
    hasMore: Boolean(hasNextPage),
  };
}

export function useNotifyLog({ id }: { id: string | number }) {
  const { isAuthorized } = useUser();
  const { readSet, markRead } = useNotificationReadStore();

  const { data, isLoading, error } = useQuery<NotifyLogs, Error>(
    [API_ENDPOINTS.NOTIFY_LOGS, String(id)],
    () => client.notifyLogs.get({ id }),
    {
      enabled: isAuthorized && Boolean(id),
      retry: false,
    },
  );

  // Opening the detail page implicitly marks the notification as read.
  useEffect(() => {
    if (data?.id) markRead(data.id);
  }, [data?.id, markRead]);

  const notification = useMemo(
    () => (data ? adaptNotification(data, readSet) : undefined),
    [data, readSet],
  );

  return { notification, isLoading, error };
}

/**
 * `GET /notifications/count` — rolling 30-day count. Combined with the
 * client-side read set to derive the "unread" badge on the header bell.
 */
export function useNotificationCount() {
  const { isAuthorized } = useUser();
  const { data, isLoading, error } = useQuery<
    KolshiNotificationCount,
    Error
  >([API_ENDPOINTS.NOTIFICATIONS_COUNT], () => client.notifyLogs.count(), {
    enabled: isAuthorized,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    count: Number(data?.count ?? 0),
    isLoading,
    error,
  };
}

/**
 * `useNotificationRead` — flips client-side "read" state for one item.
 *
 * Shape-compatible with the legacy mutation contract so call sites
 * (`NotificationLists`) keep working. The returned `isLoading`
 * is always `false` because the operation is in-memory.
 */
export function useNotificationRead() {
  const { markRead } = useNotificationReadStore();
  const queryClient = useQueryClient();
  const { mutate: readNotification } = useMutation(
    async (input: { id: string | number }) => {
      markRead(input.id);
      await client.notifyLogs.readNotifyLog(input);
      return { id: input.id };
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.NOTIFY_LOGS]);
      },
    },
  );
  return { readNotification, isLoading: false, isSuccess: true };
}

/**
 * `useNotifyLogAllRead` — marks **all currently cached** notifications
 * as read locally. The backend has no "mark all" endpoint; if new
 * notifications arrive after this call they'll show as unread again
 * (by design — they are genuinely unread).
 */
export const useNotifyLogAllRead = () => {
  const queryClient = useQueryClient();
  const { markAllRead } = useNotificationReadStore();

  return useMutation(
    async () => {
      const pages = queryClient.getQueriesData<NotifyLogsPaginator>([
        API_ENDPOINTS.NOTIFY_LOGS,
      ]);
      const ids: Array<string | number> = [];
      for (const [, paginator] of pages) {
        const items = (paginator as any)?.pages
          ? (paginator as any).pages.flatMap((p: any) => p.data ?? [])
          : paginator?.data ?? [];
        for (const item of items ?? []) {
          if (item?.id !== undefined && item?.id !== null) ids.push(item.id);
        }
      }
      markAllRead(ids);
      await client.notifyLogs.readAllNotifyLogs();
      return ids;
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.NOTIFY_LOGS]);
      },
    },
  );
};

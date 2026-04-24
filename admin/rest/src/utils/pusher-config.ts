/**
 * Pusher no-op stub — A1 (Kolshi does not use Pusher/broadcast).
 *
 * The three topbar components that import this file
 * (store-notice-bar, recent-order-bar, message-bar) are scheduled for
 * deletion in A9 together with the conversations/store-notices feature set.
 * Until then, this stub satisfies the import contract without establishing
 * any real WebSocket connection or loading the `pusher-js` package.
 *
 * @see KOLSHI_ADAPTATION_ROADMAP.md A9, M.5
 */

type PusherChannel = {
  bind: (_event: string, _callback: (...args: unknown[]) => void) => PusherChannel;
  unbind: (_event?: string) => PusherChannel;
};

const noopChannel: PusherChannel = {
  bind: () => noopChannel,
  unbind: () => noopChannel,
};

export const PusherConfig = {
  subscribe: (_channel: string): PusherChannel => noopChannel,
  unsubscribe: (_channel: string): void => {},
  disconnect: (): void => {},
  connection: { bind: () => {}, state: 'disconnected' },
};

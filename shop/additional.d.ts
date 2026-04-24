import 'little-state-machine';
import type { ComponentType, PropsWithChildren } from 'react';

declare module 'little-state-machine' {
  interface GlobalState {
    step: 'Email' | 'Token' | 'Password';
    email: string;
    token: string;
    password: string;
  }
}

/**
 * React 18 tightened the `Component.refs` signature, which breaks legacy
 * class-based typings for the libraries below. They still render fine at
 * runtime, so we override their JSX-callable shape here rather than pin
 * older `@types/react`. Add additional modules as they surface.
 */
declare module 'react-scroll' {
  export const Element: ComponentType<
    PropsWithChildren<{
      id?: string;
      name?: string;
      className?: string;
      style?: React.CSSProperties;
    }>
  >;
  export const Link: ComponentType<
    PropsWithChildren<{
      activeClass?: string;
      to: string;
      spy?: boolean;
      smooth?: boolean | string;
      offset?: number;
      duration?: number | ((distance: number) => number);
      delay?: number;
      isDynamic?: boolean;
      onSetActive?: (to: string) => void;
      onSetInactive?: (to: string) => void;
      ignoreCancelEvents?: boolean;
      hashSpy?: boolean;
      saveHashHistory?: boolean;
      containerId?: string;
      className?: string;
      style?: React.CSSProperties;
      onClick?: (event: React.MouseEvent) => void;
    }>
  >;
  export const scroller: {
    scrollTo(to: string, props?: Record<string, unknown>): void;
  };
  export const animateScroll: {
    scrollToTop(props?: Record<string, unknown>): void;
    scrollToBottom(props?: Record<string, unknown>): void;
    scrollTo(to: number, props?: Record<string, unknown>): void;
    scrollMore(offset: number, props?: Record<string, unknown>): void;
  };
  export const Events: {
    scrollEvent: {
      register(event: string, callback: (to: string, el: HTMLElement) => void): void;
      remove(event: string): void;
    };
  };
}


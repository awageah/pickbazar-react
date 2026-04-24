/**
 * Resolves the value for the `Accept-Language` request header.
 *
 * - On the client: reads `i18nextLng` from `localStorage` (persisted by i18next).
 * - On the server (SSR / `getServerSideProps`): falls back to the configured
 *   default, because `localStorage` is unavailable in Node.
 *
 * The supported set is intentionally narrow — Kolshi backend accepts only `ar`
 * and `en`; any other value is treated as unknown and mapped to the fallback.
 */

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const I18N_LOCAL_STORAGE_KEY = 'i18nextLng';

function isSupported(value: string | null | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function getDefaultLanguage(): SupportedLanguage {
  const configured = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
  return isSupported(configured) ? configured : 'ar';
}

export function resolveAcceptLanguage(): SupportedLanguage {
  const fallback = getDefaultLanguage();
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(I18N_LOCAL_STORAGE_KEY);
    return isSupported(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

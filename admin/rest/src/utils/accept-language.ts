/**
 * Resolves the value for the `Accept-Language` request header.
 *
 * - Client: reads `i18nextLng` from localStorage (persisted by next-i18next).
 * - SSR / getServerSideProps: falls back to NEXT_PUBLIC_DEFAULT_LANGUAGE
 *   because localStorage is not available in Node.
 *
 * Admin default is `ar` (matching the Kolshi backend's primary locale).
 * Only `ar` and `en` are accepted by the backend; any other value falls back.
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

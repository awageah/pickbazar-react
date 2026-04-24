import type { KolshiProductSort } from '@/types';

/**
 * Bridges the Pickbazar template sort vocabulary to Kolshi's `sortBy`
 * enum accepted by `GET /products?sortBy=`.
 *
 * Template callers use two historical shapes:
 *   1. A full `(orderBy, sortedBy)` pair — e.g. `("price", "asc")`.
 *   2. A colon-joined string — e.g. `"created_at:desc"`, `"-price"`.
 *
 * Both resolve down to one of `KolshiProductSort` so the backend only
 * ever sees a single, documented value. Unknown combinations fall back
 * to `newest` — matching the Kolshi default.
 *
 * This utility is intentionally pure (no axios import) so it can be
 * shared by `format-products-args.ts`, the SSR prefetch helpers, and
 * any component that constructs query keys directly.
 */
export function mapLegacySort(
  orderBy?: string | null,
  sortedBy?: string | null,
): KolshiProductSort {
  if (!orderBy) return 'newest';

  const rawField = orderBy.trim();
  const [field, direction] = rawField.includes(':')
    ? (rawField.split(':') as [string, string])
    : [rawField.replace(/^[-+]/, ''), rawField.startsWith('-') ? 'desc' : null];

  const normalisedField = field.toLowerCase();
  const normalisedDir = (direction ?? sortedBy ?? 'desc').toLowerCase();

  switch (normalisedField) {
    case 'price':
    case 'min_price':
    case 'max_price':
    case 'sale_price':
      return normalisedDir === 'asc' ? 'price_asc' : 'price_desc';

    case 'rating':
    case 'ratings':
    case 'review':
      return 'rating';

    case 'popular':
    case 'views':
    case 'sold':
    case 'orders_count':
      return 'popular';

    case 'created_at':
    case 'updated_at':
    case 'newest':
    default:
      return 'newest';
  }
}

/**
 * Accepts `KolshiProductSort` or any legacy pair and returns a
 * normalised `sortBy` value guaranteed to be in the Kolshi enum.
 */
export function resolveSortBy(
  candidate: unknown,
  fallback: KolshiProductSort = 'newest',
): KolshiProductSort {
  if (typeof candidate !== 'string' || candidate.length === 0) return fallback;
  const lower = candidate.toLowerCase() as KolshiProductSort;
  const allowed: readonly KolshiProductSort[] = [
    'newest',
    'popular',
    'rating',
    'price_asc',
    'price_desc',
  ];
  return allowed.includes(lower) ? lower : fallback;
}

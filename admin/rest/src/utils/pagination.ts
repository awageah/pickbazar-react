import type { PaginatorInfo } from '@/types';

/**
 * Pagination adapters bridging the template's Laravel-style `PaginatorInfo<T>`
 * and Kolshi's Spring-style `PageResponse<T>`.
 *
 * Two directions need adapting:
 *   Request:  caller supplies 1-indexed `page`; Spring expects 0-indexed.
 *   Response: Kolshi returns `{ data, total, page, perPage, lastPage }`;
 *             template consumers read `PaginatorInfo<T>`.
 *
 * Keeping the caller surface 1-indexed means existing UI pagination controls
 * and React-Query `getNextPageParam` callbacks do not need to change.
 */

export const DEFAULT_PAGE_SIZE = 10;

export interface CallerPageParams {
  /** 1-indexed page number. Defaults to `1`. */
  page?: number;
  /** Page size. Alias for Spring `size`. Defaults to {@link DEFAULT_PAGE_SIZE}. */
  limit?: number;
  /** Sort field, e.g. `created_at`. */
  orderBy?: string;
  /** Sort direction (case-insensitive). */
  sortedBy?: 'asc' | 'desc' | 'ASC' | 'DESC';
  /** Pass-through for arbitrary filter params. */
  [key: string]: unknown;
}

export interface KolshiPageResponse<T> {
  data: T[];
  total: number;
  /** 1-indexed per Kolshi handoff. */
  page: number;
  /** Matches the Java record field name `perPage` (camelCase, no snake_case Jackson config). */
  perPage: number;
  /** Matches the Java record field name `lastPage` (camelCase, no snake_case Jackson config). */
  lastPage: number;
}

/**
 * Converts caller-facing pagination params (1-indexed) into Spring-compatible
 * query params (0-indexed). Unknown keys pass through untouched so callers
 * can continue to spread filter objects.
 */
export function toSpringPageParams(
  params: CallerPageParams = {},
): Record<string, unknown> {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, orderBy, sortedBy, ...rest } =
    params;

  const springPage = Math.max(0, page - 1);

  const out: Record<string, unknown> = {
    ...rest,
    page: springPage,
    size: limit,
  };

  if (orderBy) {
    out.sort = orderBy;
    if (sortedBy) out.direction = sortedBy.toUpperCase() as 'ASC' | 'DESC';
  }

  return out;
}

/**
 * Maps Kolshi's {@link KolshiPageResponse} onto the template's
 * {@link PaginatorInfo}. URL fields are stubbed with sentinels the template
 * already tolerates (`''` when a next/prev page exists, `null` when it does not).
 *
 * Edge cases:
 *   `total === 0`   → `from = 0`, `to = 0`.
 *   Short last page → `to` reflects the actual item count, not `perPage`.
 */
export function toPaginatorInfo<T>(
  response: KolshiPageResponse<T> | null | undefined,
): PaginatorInfo<T> {
  const {
    data = [],
    total = 0,
    page = 1,
    perPage: per_page = DEFAULT_PAGE_SIZE,
    lastPage: last_page = 1,
  } = response ?? ({} as KolshiPageResponse<T>);

  const from = total === 0 ? 0 : (page - 1) * per_page + 1;
  const to = total === 0 ? 0 : Math.min(from + data.length - 1, total);

  return {
    current_page: page,
    data,
    first_page_url: '',
    from,
    last_page,
    last_page_url: '',
    links: [],
    next_page_url: page < last_page ? '' : null,
    path: '',
    per_page,
    prev_page_url: page > 1 ? '' : null,
    to,
    total,
  };
}

export type TemplateSort =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'name_asc'
  | 'name_desc';

export interface SortMapping {
  sort: string;
  direction: 'ASC' | 'DESC';
}

const SORT_MAP: Record<TemplateSort, SortMapping> = {
  newest: { sort: 'created_at', direction: 'DESC' },
  oldest: { sort: 'created_at', direction: 'ASC' },
  price_asc: { sort: 'price', direction: 'ASC' },
  price_desc: { sort: 'price', direction: 'DESC' },
  rating_desc: { sort: 'rating', direction: 'DESC' },
  name_asc: { sort: 'name', direction: 'ASC' },
  name_desc: { sort: 'name', direction: 'DESC' },
};

export function mapSort(
  key: TemplateSort | undefined | null,
): SortMapping | undefined {
  if (!key) return undefined;
  return SORT_MAP[key];
}

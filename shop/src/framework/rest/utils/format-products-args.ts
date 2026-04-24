import type { ProductQueryOptions, KolshiProductSort } from '@/types';
import { mapLegacySort, resolveSortBy } from './sort-mapper';

/**
 * Translates the Pickbazar-template product query vocabulary into the
 * Kolshi `GET /products` contract:
 *
 *   - `shop_id`         → `shopId`
 *   - `categories` slug → `categoryId` (must be numeric; a slug-only
 *     caller is passed through verbatim so the downstream call fails
 *     loudly rather than silently dropping the filter)
 *   - `min_price` / `max_price` → `minPrice` / `maxPrice` (as numbers)
 *   - `name` / `searchQuery` / `text` → `search`
 *   - `(orderBy, sortedBy)` pair → `sortBy` via `mapLegacySort`.
 *
 * Unknown keys fall through untouched so specialised callers (e.g. the
 * PDP prefetch) can still thread Kolshi-native params (`brand`,
 * `minRating`, `inStock`, `isActive`) without the helper stripping
 * them.
 */
export const formatProductsArgs = (
  options?: Partial<ProductQueryOptions>,
): Partial<ProductQueryOptions> & Record<string, unknown> => {
  const {
    limit = 30,
    price,
    min_price,
    max_price,
    categories,
    name,
    searchType: _searchType,
    searchQuery,
    text,
    shop_id,
    orderBy,
    sortedBy,
    sortBy,
    type: _type,
    manufacturer: _manufacturer,
    author: _author,
    tags: _tags,
    visibility: _visibility,
    ...rest
  } = options || {};

  const searchTerm = searchQuery ?? text ?? name;
  const shopId = rest.shopId ?? shop_id;

  const numericPrice = (value?: string | number): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const resolvedSortBy: KolshiProductSort =
    sortBy ? resolveSortBy(sortBy) : mapLegacySort(orderBy, sortedBy);

  return {
    limit,
    ...(searchTerm && { search: String(searchTerm) }),
    ...(shopId && { shopId }),
    ...(categories && { categoryId: categories }),
    ...(numericPrice(price ?? min_price) !== undefined && {
      minPrice: numericPrice(price ?? min_price),
    }),
    ...(numericPrice(max_price) !== undefined && {
      maxPrice: numericPrice(max_price),
    }),
    sortBy: resolvedSortBy,
    ...rest,
  };
};

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import type {
  AddToCartInput,
  KolshiCart,
  KolshiCartItem,
  UpdateCartItemInput,
} from '@/types';
import { useUser } from '@/framework/user';

/**
 * Empty cart used as the initial React-Query cache value for guests. The
 * store/context layer reads these fields synchronously (legacy contract),
 * so keeping a real object instead of `undefined` lets consumers mount
 * without null-checks.
 */
const EMPTY_CART: KolshiCart = {
  items: [],
  total: 0,
  total_items: 0,
  total_unique_items: 0,
  subtotal: 0,
};

/**
 * `GET /cart` — the authoritative server cart.
 *
 * - Disabled for guests: the hook returns the empty-cart placeholder
 *   above and skips the network entirely. Every consumer also shows
 *   a login modal when an anonymous user attempts to add an item
 *   (see `add-to-cart` components).
 * - Refetches on window focus so multiple tabs stay in sync without a
 *   polling timer — handoff E5 notes cart invariants must hold across
 *   tabs after checkout.
 * - The cached `KolshiCart` is the source of truth for `useCart()` /
 *   `useAddItemToCart()` / `useUpdateCartItem()` etc.
 */
export function useCartQuery() {
  const { isAuthorized } = useUser();
  return useQuery<KolshiCart, Error>(
    [API_ENDPOINTS.CART],
    () => client.cart.get(),
    {
      enabled: Boolean(isAuthorized),
      refetchOnWindowFocus: true,
      staleTime: 30_000,
      placeholderData: EMPTY_CART,
      keepPreviousData: true,
    },
  );
}

/**
 * Optimistic-update helper shared by the three mutations below. Snapshots
 * the current cache, applies `mutator` synchronously, and returns the
 * snapshot so `onError` can roll back. We refetch on settle regardless
 * so the true server state always wins — optimistic writes only exist
 * to keep the UI responsive during the round-trip.
 */
function useCartMutationHelpers() {
  const queryClient = useQueryClient();
  const cartKey = [API_ENDPOINTS.CART];

  return {
    cartKey,
    queryClient,
    onMutateFactory:
      (mutator: (previous: KolshiCart) => KolshiCart) => async () => {
        await queryClient.cancelQueries(cartKey);
        const previous =
          queryClient.getQueryData<KolshiCart>(cartKey) ?? EMPTY_CART;
        queryClient.setQueryData<KolshiCart>(cartKey, mutator(previous));
        return { previous };
      },
    onErrorRollback: (context: { previous: KolshiCart } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(cartKey, context.previous);
      }
    },
    invalidate: () => {
      queryClient.invalidateQueries(cartKey);
    },
  };
}

/** `POST /cart/items`. Optimistic increment when the item is already present. */
export function useAddItemToCart() {
  const { t } = useTranslation('common');
  const { cartKey, queryClient, onMutateFactory, onErrorRollback, invalidate } =
    useCartMutationHelpers();

  return useMutation<KolshiCart, Error, AddToCartInput, { previous: KolshiCart }>(
    (input) => client.cart.addItem(input),
    {
      onMutate: async (input) => {
        return onMutateFactory((previous) => {
          const items = [...previous.items];
          const idx = items.findIndex(
            (i) =>
              String(i.product_id) === String(input.product_id) &&
              String(i.variation_id ?? '') ===
                String(input.variation_id ?? ''),
          );
          if (idx >= 0) {
            items[idx] = {
              ...items[idx],
              quantity: items[idx].quantity + input.quantity,
            };
          } else {
            items.push({
              id: `optimistic-${Date.now()}`,
              product_id: input.product_id,
              variation_id: input.variation_id ?? null,
              quantity: input.quantity,
              unit_price: 0,
              subtotal: 0,
            });
          }
          return { ...previous, items };
        })();
      },
      onError: (_e, _input, context) => {
        onErrorRollback(context);
        toast.error(t('error-add-to-cart-failed'));
      },
      onSuccess: (data) => {
        if (data) queryClient.setQueryData(cartKey, data);
      },
      onSettled: invalidate,
    },
  );
}

/** `PUT /cart/items/{id}` — absolute quantity (clamped to ≥0 by backend). */
export function useUpdateCartItem() {
  const { t } = useTranslation('common');
  const { cartKey, queryClient, onMutateFactory, onErrorRollback, invalidate } =
    useCartMutationHelpers();

  return useMutation<
    KolshiCart,
    Error,
    { id: number | string } & UpdateCartItemInput,
    { previous: KolshiCart }
  >(({ id, quantity }) => client.cart.updateItem(id, { quantity }), {
    onMutate: async ({ id, quantity }) =>
      onMutateFactory((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          String(item.id) === String(id) ? { ...item, quantity } : item,
        ),
      }))(),
    onError: (_e, _input, context) => {
      onErrorRollback(context);
      toast.error(t('error-update-cart-failed'));
    },
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(cartKey, data);
    },
    onSettled: invalidate,
  });
}

/** `DELETE /cart/items/{id}`. */
export function useRemoveCartItem() {
  const { t } = useTranslation('common');
  const { queryClient, cartKey, onMutateFactory, onErrorRollback, invalidate } =
    useCartMutationHelpers();

  return useMutation<
    KolshiCart | void,
    Error,
    { id: number | string },
    { previous: KolshiCart }
  >(({ id }) => client.cart.removeItem(id), {
    onMutate: async ({ id }) =>
      onMutateFactory((previous) => ({
        ...previous,
        items: previous.items.filter(
          (item) => String(item.id) !== String(id),
        ),
      }))(),
    onError: (_e, _input, context) => {
      onErrorRollback(context);
      toast.error(t('error-remove-cart-failed'));
    },
    onSuccess: (data) => {
      if (data && typeof data === 'object') {
        queryClient.setQueryData(cartKey, data);
      }
    },
    onSettled: invalidate,
  });
}

/** `DELETE /cart` — wipes everything. */
export function useClearCart() {
  const { t } = useTranslation('common');
  const { cartKey, queryClient, invalidate } = useCartMutationHelpers();

  return useMutation<KolshiCart | void, Error, void>(
    () => client.cart.clear(),
    {
      onMutate: async () => {
        await queryClient.cancelQueries(cartKey);
        queryClient.setQueryData(cartKey, EMPTY_CART);
      },
      onError: () => {
        toast.error(t('error-clear-cart-failed'));
      },
      onSettled: invalidate,
    },
  );
}

/**
 * Derives the frontend `Item[]` shape consumed by legacy cart UI
 * (`CartItem`, `CartSidebarView`, order summaries, etc.) from a Kolshi
 * server cart. The template expects flat fields like `image`, `name`,
 * `price`, `itemTotal`, `stock`, so we unpack the nested `product`
 * relation here instead of sprinkling adapters across components.
 */
export function adaptCartItems(cart?: KolshiCart): KolshiCartItem[] {
  if (!cart?.items) return [];
  return cart.items.map((item) => {
    const product = item.product as any;
    const variation = item.variation as any;
    const unit = variation?.unit ?? product?.unit;
    const price = Number(
      item.sale_price ?? item.unit_price ?? variation?.price ?? product?.price ?? 0,
    );
    const image =
      item.image ??
      product?.image?.thumbnail ??
      product?.image?.original ??
      null;
    return {
      ...item,
      name:
        item.name ??
        [product?.name, variation?.title].filter(Boolean).join(' - ') ??
        '',
      slug: item.slug ?? product?.slug,
      image,
      unit,
      price,
      itemTotal:
        item.subtotal ??
        Number(price) * Number(item.quantity ?? 0),
      stock: item.stock ?? variation?.quantity ?? product?.quantity ?? 0,
      shop_id: item.shop_id ?? product?.shop?.id,
      shop: item.shop ?? product?.shop ?? null,
      is_digital: Boolean(product?.is_digital),
      language: 'en',
    } as KolshiCartItem;
  });
}

export { EMPTY_CART };

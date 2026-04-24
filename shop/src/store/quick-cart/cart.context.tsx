import React, { useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { verifiedResponseAtom } from '@/store/checkout';
import { useUser } from '@/framework/user';
import { useModalAction } from '@/components/ui/modal/modal.context';
import {
  adaptCartItems,
  useAddItemToCart,
  useCartQuery,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/framework/cart';
import type { Item } from './cart.utils';
import type { KolshiCart, KolshiCartItem } from '@/types';
import {
  calculateTotal,
  calculateTotalItems,
  calculateUniqueItems,
} from './cart.utils';

/**
 * Legacy `CartProvider` contract preserved for backwards compatibility.
 *
 * S4 replaced the Jotai/local-storage store with a React-Query-backed
 * server cart (`GET /cart`, `POST /cart/items`, …), but every component
 * in the template imports `useCart()` and relies on the synchronous
 * `{ items, total, totalItems, … }` shape below. Keeping the provider
 * signature lets S4 ship without a sweeping call-site rewrite; the
 * methods now proxy to Kolshi mutations with optimistic UI updates.
 *
 * Guest behaviour:
 *   - `addItemToCart` / `removeItemFromCart` / `clearItemFromCart`
 *     immediately open the `LOGIN_VIEW` modal (decision log F.2)
 *     rather than mutating local state.
 *   - Read fields (`items`, `total`, `isEmpty`, …) stay at zero so
 *     the header/cart sidebar render an empty state.
 */
export interface CartProviderState {
  items: KolshiCartItem[];
  isEmpty: boolean;
  totalItems: number;
  totalUniqueItems: number;
  total: number;
  meta?: Record<string, unknown> | null;
  language: string;
  addItemsToCart: (items: Item[]) => void;
  addItemToCart: (item: Item, quantity: number) => void;
  removeItemFromCart: (id: Item['id']) => void;
  clearItemFromCart: (id: Item['id']) => void;
  getItemFromCart: (id: Item['id']) => KolshiCartItem | undefined;
  isInCart: (id: Item['id']) => boolean;
  isInStock: (id: Item['id']) => boolean;
  resetCart: () => void;
  updateCartLanguage: (language: string) => void;
}

export const cartContext = React.createContext<CartProviderState | undefined>(
  undefined,
);
cartContext.displayName = 'CartContext';

export const useCart = () => {
  const context = React.useContext(cartContext);
  if (context === undefined) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return context;
};

/**
 * Picks `{ productId, variationId }` off a legacy `Item`. The template's
 * cart item id is either `"<productId>"` (no variation) or
 * `"<productId>.<variationId>"` (see `generate-cart-item.ts`). We also
 * honour `productId` / `variationId` when they are populated directly.
 */
function decomposeItemId(
  item: Item,
): { productId: string | number; variationId?: string | number } {
  const productId =
    (item as any).productId ?? extractProductIdFromCompositeId(item.id);
  const variationId =
    (item as any).variationId ??
    extractVariationIdFromCompositeId(item.id) ??
    undefined;
  return { productId, variationId };
}

function extractProductIdFromCompositeId(id: Item['id']): string | number {
  if (typeof id !== 'string') return id;
  return id.split('.')[0];
}

function extractVariationIdFromCompositeId(
  id: Item['id'],
): string | number | undefined {
  if (typeof id !== 'string' || !id.includes('.')) return undefined;
  return id.split('.')[1];
}

/**
 * Resolves the Kolshi server-cart row id (`KolshiCartItem.id`) for a
 * logical frontend item. The lookup first tries the `(productId,
 * variationId)` pair; falling back to the raw id for pre-optimistic
 * updates where we may still be holding a template-style id.
 */
function findServerCartItemId(
  items: KolshiCartItem[],
  clientId: Item['id'],
): number | string | undefined {
  const { productId, variationId } = decomposeItemId({ id: clientId, price: 0 });
  const match = items.find((row) => {
    const productMatches = String(row.product_id) === String(productId);
    const variationMatches =
      String(row.variation_id ?? '') === String(variationId ?? '');
    return productMatches && variationMatches;
  });
  return match?.id;
}

export const CartProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthorized } = useUser();
  const { openModal } = useModalAction();
  const { data } = useCartQuery();
  const addMutation = useAddItemToCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();
  const [, emptyVerifiedResponse] = useAtom(verifiedResponseAtom);

  const items = useMemo(
    () => adaptCartItems((data as KolshiCart | undefined) ?? undefined),
    [data],
  );

  React.useEffect(() => {
    emptyVerifiedResponse(null);
  }, [emptyVerifiedResponse, items.length]);

  /**
   * Gate every mutation on auth. Surfacing the login modal here keeps
   * the UX consistent across all entry points (PDP, cart sidebar,
   * category cards) without changing caller code.
   */
  const requireAuth = useCallback((): boolean => {
    if (isAuthorized) return true;
    openModal('LOGIN_VIEW');
    return false;
  }, [isAuthorized, openModal]);

  const addItemToCart = useCallback(
    (item: Item, quantity: number) => {
      if (!requireAuth()) return;
      const { productId, variationId } = decomposeItemId(item);
      addMutation.mutate({
        product_id: productId,
        ...(variationId !== undefined ? { variation_id: variationId } : {}),
        quantity,
      });
    },
    [addMutation, requireAuth],
  );

  const addItemsToCart = useCallback(
    (payload: Item[]) => {
      if (!requireAuth()) return;
      payload.forEach((item) => {
        const { productId, variationId } = decomposeItemId(item);
        addMutation.mutate({
          product_id: productId,
          ...(variationId !== undefined ? { variation_id: variationId } : {}),
          quantity: item.quantity ?? 1,
        });
      });
    },
    [addMutation, requireAuth],
  );

  const removeItemFromCart = useCallback(
    (id: Item['id']) => {
      if (!requireAuth()) return;
      const match = items.find(
        (row) => String(row.id) === String(id) || String(row.product_id) === String(id),
      );
      if (!match) return;
      const nextQuantity = (match.quantity ?? 0) - 1;
      if (nextQuantity <= 0) {
        removeMutation.mutate({ id: match.id });
      } else {
        updateMutation.mutate({ id: match.id, quantity: nextQuantity });
      }
    },
    [items, removeMutation, updateMutation, requireAuth],
  );

  const clearItemFromCart = useCallback(
    (id: Item['id']) => {
      if (!requireAuth()) return;
      const serverId = findServerCartItemId(items, id);
      if (serverId === undefined) return;
      removeMutation.mutate({ id: serverId });
    },
    [items, removeMutation, requireAuth],
  );

  const getItemFromCart = useCallback(
    (id: Item['id']) =>
      items.find(
        (row) =>
          String(row.id) === String(id) ||
          String(row.product_id) === String(id),
      ),
    [items],
  );

  const isInCart = useCallback(
    (id: Item['id']) => Boolean(getItemFromCart(id)),
    [getItemFromCart],
  );

  const isInStock = useCallback(
    (id: Item['id']) => {
      const match = getItemFromCart(id);
      if (!match) return false;
      if (typeof match.in_stock === 'boolean') return match.in_stock;
      if (typeof match.stock === 'number') {
        return (match.quantity ?? 0) < match.stock;
      }
      return true;
    },
    [getItemFromCart],
  );

  const resetCart = useCallback(() => {
    if (!isAuthorized) return;
    clearMutation.mutate();
  }, [clearMutation, isAuthorized]);

  /**
   * Language-aware carts are not a Kolshi concept (the server cart is
   * language-agnostic). Kept as a no-op so legacy UI that calls
   * `updateCartLanguage` on locale change does not throw.
   */
  const updateCartLanguage = useCallback((_language: string) => {
    /* no-op under Kolshi */
  }, []);

  const value = useMemo<CartProviderState>(() => {
    const totalUniqueItems = calculateUniqueItems(items as unknown as Item[]);
    const totalItems = calculateTotalItems(items as unknown as Item[]);
    const total =
      (data as KolshiCart | undefined)?.total ??
      calculateTotal(items as unknown as Item[]);
    return {
      items,
      isEmpty: totalUniqueItems === 0,
      totalItems,
      totalUniqueItems,
      total,
      meta: null,
      language: 'en',
      addItemsToCart,
      addItemToCart,
      removeItemFromCart,
      clearItemFromCart,
      getItemFromCart,
      isInCart,
      isInStock,
      resetCart,
      updateCartLanguage,
    };
  }, [
    items,
    data,
    addItemToCart,
    addItemsToCart,
    removeItemFromCart,
    clearItemFromCart,
    getItemFromCart,
    isInCart,
    isInStock,
    resetCart,
    updateCartLanguage,
  ]);

  return <cartContext.Provider value={value}>{children}</cartContext.Provider>;
};

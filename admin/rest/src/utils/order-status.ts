import { OrderStatus, PaymentStatus } from '@/types';

/**
 * Kolshi order status machine — sequential states only.
 *
 * State machine:
 *   ORDER_RECEIVED → PROCESSING → AT_LOCAL_FACILITY → OUT_FOR_DELIVERY → COMPLETED
 *
 * CANCELLED is allowed from ORDER_RECEIVED and PROCESSING only.
 */
export const ORDER_STATUS = [
  {
    name: 'text-order-received',
    status: OrderStatus.ORDER_RECEIVED,
    serial: 1,
  },
  {
    name: 'text-order-processing',
    status: OrderStatus.PROCESSING,
    serial: 2,
  },
  {
    name: 'text-order-at-local-facility',
    status: OrderStatus.AT_LOCAL_FACILITY,
    serial: 3,
  },
  {
    name: 'text-order-out-for-delivery',
    status: OrderStatus.OUT_FOR_DELIVERY,
    serial: 4,
  },
  {
    name: 'text-order-completed',
    status: OrderStatus.COMPLETED,
    serial: 5,
  },
  {
    name: 'text-order-cancelled',
    status: OrderStatus.CANCELLED,
    serial: 6,
  },
];

/** Which status comes next in the happy path (returns undefined if terminal). */
export const NEXT_STATUS: Record<string, string | undefined> = {
  [OrderStatus.ORDER_RECEIVED]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.AT_LOCAL_FACILITY,
  [OrderStatus.AT_LOCAL_FACILITY]: OrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: undefined,
  [OrderStatus.CANCELLED]: undefined,
};

/** Returns true if cancellation is still allowed for the given status. */
export function canCancel(status: string): boolean {
  return (
    status === OrderStatus.ORDER_RECEIVED ||
    status === OrderStatus.PROCESSING
  );
}

/** Returns true if the order has reached a terminal state. */
export function isTerminal(status: string): boolean {
  return (
    status === OrderStatus.COMPLETED ||
    status === OrderStatus.CANCELLED
  );
}

/**
 * Returns the portion of ORDER_STATUS to display in the progress box
 * (only the linear happy path — 5 steps).
 */
export const filterOrderStatus = (
  orderStatus: typeof ORDER_STATUS,
  _paymentStatus: PaymentStatus,
  currentStatusIndex: number,
) => {
  const happyPath = orderStatus.filter((s) => s.status !== OrderStatus.CANCELLED);
  if (currentStatusIndex > happyPath.length - 1) {
    return [...happyPath.slice(0, 4), orderStatus[currentStatusIndex]];
  }
  return happyPath;
};

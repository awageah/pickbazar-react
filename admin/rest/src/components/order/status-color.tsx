/** Maps Kolshi order/payment status strings to Tailwind badge classes. */
const StatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'ORDER_RECEIVED':
    case 'PENDING':
      return 'bg-status-pending bg-opacity-10 text-status-pending';

    case 'PROCESSING':
      return 'bg-status-processing bg-opacity-10 text-status-processing';

    case 'AT_LOCAL_FACILITY':
    case 'OUT_FOR_DELIVERY':
      return 'bg-status-out-for-delivery bg-opacity-10 text-status-out-for-delivery';

    case 'COMPLETED':
    case 'APPROVED':
    case 'PAID':
      return 'bg-status-complete bg-opacity-10 text-status-complete';

    case 'CANCELLED':
    case 'REFUNDED':
    case 'REJECTED':
      return 'bg-rose-400 bg-opacity-10 text-status-canceled';

    case 'FAILED':
      return 'bg-status-failed bg-opacity-10 text-status-failed';

    case 'CASH_ON_DELIVERY':
      return 'bg-accent bg-opacity-10 !text-accent';

    default:
      return 'bg-accent bg-opacity-10 !text-accent';
  }
};

export default StatusColor;

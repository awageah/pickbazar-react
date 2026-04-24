import dynamic from 'next/dynamic';

const VerifiedItemList = dynamic(
  () => import('@/components/checkout/item/verified-item-list'),
);

/**
 * Checkout right-side panel.
 *
 * Pre-Kolshi, this component toggled between `UnverifiedItemList`
 * (before the "Check availability" verification step) and
 * `VerifiedItemList` (after). Kolshi F.6 removed the verification
 * round-trip, so the panel always renders the full summary + payment
 * grid + place-order button. We keep the export so pages importing it
 * don't need to change.
 */
export const RightSideView = ({
  hideTitle: _hideTitle = false,
}: {
  hideTitle?: boolean;
}) => {
  return <VerifiedItemList />;
};

export default RightSideView;

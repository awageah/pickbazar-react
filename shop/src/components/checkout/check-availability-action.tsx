/**
 * Legacy "check availability" button — Kolshi F.6 `Hide`.
 *
 * Kolshi has no pre-place-order verification endpoint, so this
 * component is now a no-op placeholder. We keep the export to avoid
 * rewriting every importer; the component renders nothing, so the
 * template's `UnverifiedItemList` still mounts cleanly but no
 * button is shown.
 *
 * Removed entirely in S6 alongside the checkout "verified"
 * state machine.
 */
export const CheckAvailabilityAction: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = () => null;

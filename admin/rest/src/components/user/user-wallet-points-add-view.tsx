/**
 * Wallet / points feature is not available in Kolshi. This stub keeps the
 * managed-modal switch from throwing. The modal is never opened because
 * ActionButtons no longer passes `showAddWalletPoints`.
 * @deprecated A.Delete — remove in A9 cleanup
 */
const UserWalletPointsAddView = () => (
  <div className="m-auto flex w-full max-w-sm flex-col items-center rounded bg-light p-6 text-center">
    <p className="text-sm text-gray-500">Wallet feature is not available.</p>
  </div>
);

export default UserWalletPointsAddView;

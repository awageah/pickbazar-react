import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useRemoveStaffMutation } from '@/data/staff';
import { useShopQuery } from '@/data/shop';
import { useRouter } from 'next/router';

const StaffDeleteView = () => {
  const { mutate: removeStaff, isLoading: loading } = useRemoveStaffMutation();

  const { data: staffId } = useModalState();
  const { closeModal } = useModalAction();
  const { query } = useRouter();

  const { data: shopData } = useShopQuery({ slug: query.shop as string });

  async function handleDelete() {
    if (!shopData?.id) return;
    removeStaff({ shopId: shopData.id, staffId });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading || !shopData?.id}
    />
  );
};

export default StaffDeleteView;

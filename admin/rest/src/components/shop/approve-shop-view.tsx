import ConfirmationCard from '@/components/common/confirmation-card';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useApproveShopMutation } from '@/data/shop';
import { useTranslation } from 'next-i18next';

/**
 * A4 — Kolshi shop approval is a simple POST /shops/{id}/approve with no
 * commission-rate payload. The DefaultCommission/MultiCommission form parts
 * are removed. The `data.data` (multiCommission flag) is no longer read.
 */
const ApproveShopView = () => {
  const { t } = useTranslation();
  const { mutate: approveShop, isLoading: loading } = useApproveShopMutation();
  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();

  const shopId: string =
    typeof modalData === 'object' ? modalData?.id : (modalData as string);

  function handleApprove() {
    approveShop({ id: shopId });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleApprove}
      deleteBtnLoading={loading}
      deleteBtnText="text-shop-approve-button"
      icon={<CheckMarkCircle className="m-auto mt-4 h-10 w-10 text-accent" />}
      deleteBtnClassName="!bg-accent focus:outline-none hover:!bg-accent-hover focus:!bg-accent-hover"
      cancelBtnClassName="!bg-red-600 focus:outline-none hover:!bg-red-700 focus:!bg-red-700"
      title="text-approve-shop"
      description={t('text-shop-approve-description', {
        defaultValue: 'Are you sure you want to approve this shop?',
      })}
    />
  );
};

export default ApproveShopView;

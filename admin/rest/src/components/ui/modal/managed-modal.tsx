import Modal from '@/components/ui/modal/modal';
import dynamic from 'next/dynamic';
import { MODAL_VIEWS, useModalAction, useModalState } from './modal.context';

const BanCustomerView = dynamic(
  () => import('@/components/user/user-ban-view'),
);
const MakeAdminView = dynamic(
  () => import('@/components/user/make-admin-view'),
);
const CategoryDeleteView = dynamic(
  () => import('@/components/category/category-delete-view'),
);
const CouponDeleteView = dynamic(
  () => import('@/components/coupon/coupon-delete-view'),
);
const ProductDeleteView = dynamic(
  () => import('@/components/product/product-delete-view'),
);
const ApproveShopView = dynamic(
  () => import('@/components/shop/approve-shop-view'),
);
const DisApproveShopView = dynamic(
  () => import('@/components/shop/disapprove-shop-view'),
);
const RemoveStaffView = dynamic(
  () => import('@/components/shop/staff-delete-view'),
);
const ReviewDeleteView = dynamic(
  () => import('@/components/reviews/review-delete-view'),
);
const SearchModal = dynamic(
  () => import('@/components/layouts/topbar/search-modal'),
);
const DescriptionView = dynamic(
  () => import('@/components/shop-single/description-modal'),
);
const ApproveCouponView = dynamic(
  () => import('@/components/coupon/approve-coupon-view'),
);
const DisApproveCouponView = dynamic(
  () => import('@/components/coupon/disapprove-coupon-view'),
);
const CreateOrUpdateAddressForm = dynamic(
  () => import('@/components/address/create-or-update'),
);

function renderModal(view: MODAL_VIEWS | undefined, data: any) {
  switch (view) {
    case 'DELETE_PRODUCT':
      return <ProductDeleteView />;
    case 'DELETE_CATEGORY':
      return <CategoryDeleteView />;
    case 'DELETE_COUPON':
      return <CouponDeleteView />;
    case 'BAN_CUSTOMER':
      return <BanCustomerView />;
    case 'SHOP_APPROVE_VIEW':
      return <ApproveShopView />;
    case 'SHOP_DISAPPROVE_VIEW':
      return <DisApproveShopView />;
    case 'DELETE_STAFF':
      return <RemoveStaffView />;
    case 'MAKE_ADMIN':
      return <MakeAdminView />;
    case 'DELETE_REVIEW':
      return <ReviewDeleteView />;
    case 'ADD_OR_UPDATE_ADDRESS':
      return <CreateOrUpdateAddressForm />;
    case 'SEARCH_VIEW':
      return <SearchModal />;
    case 'DESCRIPTION_VIEW':
      return <DescriptionView />;
    case 'COUPON_APPROVE_VIEW':
      return <ApproveCouponView />;
    case 'COUPON_DISAPPROVE_VIEW':
      return <DisApproveCouponView />;
    default:
      return null;
  }
}

const ManagedModal = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <Modal open={isOpen} onClose={closeModal}>
      {renderModal(view, data)}
    </Modal>
  );
};

export default ManagedModal;

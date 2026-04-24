import dynamic from 'next/dynamic';
import Modal from '@/components/ui/modal/modal';
import { useModalAction, useModalState } from './modal.context';

/**
 * Kolshi S6 — modal registry after final cleanup.
 *
 * Removed relative to the stock template:
 *   - `REFUND_REQUEST`, `QUESTION_FORM`, `USE_NEW_PAYMENT`, `ADD_NEW_CARD`,
 *     `DELETE_CARD_MODAL`, `GATEWAY_MODAL`, `STRIPE_ELEMENT_MODAL`,
 *     `ADD_OR_UPDATE_GUEST_ADDRESS` (deleted in S4 — cards, refunds,
 *     questions, guest checkout, gateway).
 *   - `ABUSE_REPORT` (deleted in S6 — Kolshi has no abuse-report endpoint,
 *     decision log I.4 Delete).
 *   - `NEWSLETTER_MODAL` (deleted in S6 — newsletter subscription is not
 *     implemented in Kolshi, decision log N.3 Delete).
 *   - `LOCATION_BASED_SHOP` (deleted in S6 — Google-Maps near-by search
 *     is not supported in Kolshi, decision log L.8 Delete).
 */

const OtpLoginView = dynamic(() => import('@/components/auth/otp-login'));
const Login = dynamic(() => import('@/components/auth/login-form'), {
  ssr: false,
});
const Register = dynamic(() => import('@/components/auth/register-form'));
const ForgotPassword = dynamic(
  () => import('@/components/auth/forgot-password'),
);
const ProductDetailsModalView = dynamic(
  () => import('@/components/products/details/popup'),
  { ssr: false },
);
const ShopInfoCard = dynamic(() => import('@/components/shops/sidebar'));
const CreateOrUpdateAddressForm = dynamic(
  () => import('@/components/address/address-form'),
  { ssr: false },
);
const AddressDeleteView = dynamic(
  () => import('@/components/address/delete-view'),
);
const AddOrUpdateCheckoutContact = dynamic(
  () => import('@/components/checkout/contact/add-or-update'),
);
const ProfileAddOrUpdateContact = dynamic(
  () => import('@/components/profile/profile-add-or-update-contact'),
);
const ReviewRating = dynamic(() => import('@/components/reviews/review-form'));
const ProductVariation = dynamic(
  () => import('@/components/products/variation-modal'),
);
const ReviewImageModal = dynamic(
  () => import('@/components/reviews/review-image-modal'),
);
const PaymentModal = dynamic(
  () => import('@/components/payment/payment-modal'),
  { ssr: false },
);
const PromoPopup = dynamic(() => import('@/components/promo-popup'), {
  ssr: false,
});
const ReviewPopupModal = dynamic(() => import('@/components/review-popup'), {
  ssr: false,
});

const ManagedModal = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  if (view === 'PAYMENT_MODAL') {
    return <PaymentModal />;
  }
  if (view === 'PROMO_POPUP_MODAL') {
    return <PromoPopup />;
  }
  if (view === 'REVIEW_POPUP_MODAL') {
    return <ReviewPopupModal />;
  }
  return (
    <Modal open={isOpen} onClose={closeModal}>
      {view === 'LOGIN_VIEW' && <Login />}
      {view === 'REGISTER' && <Register />}
      {view === 'FORGOT_VIEW' && <ForgotPassword />}
      {view === 'OTP_LOGIN' && <OtpLoginView />}
      {view === 'ADD_OR_UPDATE_ADDRESS' && <CreateOrUpdateAddressForm />}
      {view === 'ADD_OR_UPDATE_CHECKOUT_CONTACT' && (
        <AddOrUpdateCheckoutContact />
      )}
      {view === 'ADD_OR_UPDATE_PROFILE_CONTACT' && (
        <ProfileAddOrUpdateContact />
      )}
      {view === 'DELETE_ADDRESS' && <AddressDeleteView />}
      {view === 'PRODUCT_DETAILS' && (
        <ProductDetailsModalView productSlug={data} />
      )}
      {view === 'SHOP_INFO' && (
        <ShopInfoCard
          shop={data?.shop}
          cardClassName="!hidden"
          className="!flex !h-screen !w-screen max-w-screen-sm flex-col"
        />
      )}
      {view === 'REVIEW_RATING' && <ReviewRating />}
      {view === 'SELECT_PRODUCT_VARIATION' && (
        <ProductVariation productSlug={data} />
      )}
      {view === 'REVIEW_IMAGE_POPOVER' && <ReviewImageModal />}
    </Modal>
  );
};

export default ManagedModal;

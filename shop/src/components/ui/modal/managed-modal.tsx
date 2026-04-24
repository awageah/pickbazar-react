import dynamic from 'next/dynamic';
import Modal from '@/components/ui/modal/modal';
import { useModalAction, useModalState } from './modal.context';

/**
 * Kolshi S4 — modal registry after cleanup.
 *
 * Removed: `REFUND_REQUEST`, `QUESTION_FORM`, `USE_NEW_PAYMENT`,
 * `ADD_NEW_CARD`, `DELETE_CARD_MODAL`, `GATEWAY_MODAL`,
 * `STRIPE_ELEMENT_MODAL`, `ADD_OR_UPDATE_GUEST_ADDRESS`. These surfaces
 * are either deleted (cards, refunds, questions, guest checkout) or
 * deferred to a later phase (gateway / Stripe Elements).
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
const LocationBasedShopForm = dynamic(
  () => import('@/components/form/location-based-shop-form'),
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
const AbuseReport = dynamic(() => import('@/components/reviews/abuse-report'));
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
const NewsLetterModal = dynamic(
  () => import('@/components/maintenance/news-letter'),
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
      {view === 'LOCATION_BASED_SHOP' && <LocationBasedShopForm />}
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
      {view === 'ABUSE_REPORT' && <AbuseReport data={data} />}
      {view === 'SELECT_PRODUCT_VARIATION' && (
        <ProductVariation productSlug={data} />
      )}
      {view === 'REVIEW_IMAGE_POPOVER' && <ReviewImageModal />}
      {view === 'NEWSLETTER_MODAL' && <NewsLetterModal />}
    </Modal>
  );
};

export default ManagedModal;

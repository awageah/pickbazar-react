import { useModalAction } from '@/components/ui/modal/modal.context';
import Modal from '@/components/ui/modal/modal';
import { useTranslation } from 'next-i18next';

/**
 * Kolshi H.2 — legacy gateway modals (Stripe / Razorpay / PayPal /
 * Paystack / Mollie / …) are removed. The only live gateway today is
 * COD, which completes synchronously on order creation, so this modal
 * simply surfaces a "feature coming soon" message for any route that
 * still opens `PAYMENT_MODAL`. Once H.1 lands (Stripe webhook), a real
 * Stripe form replaces the placeholder.
 */
const PaymentModal = () => {
  const { closeModal } = useModalAction();
  const { t } = useTranslation('common');

  return (
    <Modal open onClose={closeModal}>
      <div className="bg-light p-6 md:p-10 max-w-md w-full">
        <h3 className="mb-3 text-lg font-semibold text-heading">
          {t('text-online-payments-coming-soon-title')}
        </h3>
        <p className="text-sm text-body">
          {t('text-online-payments-coming-soon-body')}
        </p>
        <button
          type="button"
          onClick={closeModal}
          className="mt-6 inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-semibold text-light transition hover:bg-accent-hover"
        >
          {t('text-got-it')}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;

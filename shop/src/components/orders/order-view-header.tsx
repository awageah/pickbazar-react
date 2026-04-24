import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import StatusColor from '@/components/orders/status-color';
import Badge from '@/components/ui/badge';
import { SpinnerLoader } from '@/components/ui/loaders/spinner/spinner';
import { Order } from '@/types';

interface OrderViewHeaderProps {
  order: Order;
  wrapperClassName?: string;
  buttonSize?: 'big' | 'medium' | 'small';
  loading?: boolean;
}

/**
 * Kolshi N.1 — Payment gateway switching / pay-now affordances are
 * dropped until the webhook flow lands. This header shows the order +
 * payment status only. Refund badges are also removed (F.7 Delete).
 */
export default function OrderViewHeader({
  order,
  wrapperClassName = 'lg:px-11 lg:py-5 p-6',
  loading = false,
}: OrderViewHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <div className={cn(`bg-[#F7F8FA] ${wrapperClassName}`)}>
      <div className="flex flex-col flex-wrap items-center justify-between mb-0 text-base font-bold gap-x-8 text-heading sm:flex-row lg:flex-nowrap">
        <div className="order-2 grid w-full max-w-full basis-full grid-cols-1 justify-between gap-6 xs:flex-nowrap sm:order-1 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="block text-xs shrink-0 grow-0 basis-auto xs:text-base lg:inline-block">
              {t('text-order-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.order_status) as string}
                  color={StatusColor(order?.order_status)}
                  className="min-h-[2rem] items-center justify-center text-[9px] !leading-none xs:text-sm"
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 md:ml-auto">
            <span className="block text-xs shrink-0 grow-0 basis-auto xs:text-base lg:inline-block">
              {t('text-payment-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.payment_status) as string}
                  color={StatusColor(order?.payment_status)}
                  className="min-h-[2rem] items-center justify-center truncate whitespace-nowrap text-[9px] !leading-none xs:text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

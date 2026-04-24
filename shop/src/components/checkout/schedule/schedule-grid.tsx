import Input from '@/components/ui/forms/input';
import { useAtom } from 'jotai';
import { deliveryTimeAtom } from '@/store/checkout';
import { useTranslation } from 'next-i18next';

interface ScheduleProps {
  label: string;
  className?: string;
  count?: number;
}

/**
 * Kolshi F.6 / N.1 — delivery scheduling collapses to a single free-text
 * preference. The template's RadioGroup of pre-defined windows is gone
 * because Kolshi stores `delivery_time` as a plain string on the order;
 * there is no backend catalogue of schedules. Callers keep setting the
 * `deliveryTimeAtom` so the existing place-order payload still contains
 * a `delivery_time` value.
 */
export const ScheduleGrid: React.FC<ScheduleProps> = ({
  label,
  className,
  count,
}) => {
  const { t } = useTranslation('common');
  const [selectedSchedule, setSchedule] = useAtom(deliveryTimeAtom);
  const value =
    typeof selectedSchedule === 'string'
      ? selectedSchedule
      : selectedSchedule?.title ?? '';

  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>
      </div>
      <Input
        name="delivery_time"
        variant="outline"
        placeholder={t('text-delivery-time-placeholder') as string}
        value={value}
        onChange={(e) =>
          setSchedule({ title: e.target.value } as any)
        }
      />
      <p className="mt-2 text-xs text-body">
        {t('text-delivery-time-hint')}
      </p>
    </div>
  );
};
export default ScheduleGrid;

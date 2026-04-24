import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { CloseIcon } from '@/components/icons/close-icon';
import { PencilIcon } from '@/components/icons/pencil-icon';
import { CheckIcon } from '@/components/icons/check-icon';
import type { Address } from '@/types';

interface AddressProps {
  address: Address;
  checked: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  isSettingDefault?: boolean;
}

/**
 * Kolshi addresses ship a flat `address: string`; the legacy nested object
 * shape is handled as a fallback so un-migrated fixtures still render during
 * the migration window.
 */
function formatKolshiAddress(address: Address['address']): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [
    address.street_address,
    address.city,
    address.state,
    address.zip,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

const AddressCard: React.FC<AddressProps> = ({
  checked,
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
}) => {
  const { t } = useTranslation('common');
  const isDefault = Boolean(address?.is_default);
  return (
    <div
      className={classNames(
        'group relative rounded border p-4 transition hover:border-accent',
        {
          'border-accent shadow-sm': checked,
          'border-transparent bg-gray-100': !checked,
        },
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold capitalize text-heading">
          {address?.title}
        </p>
        {isDefault && (
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            {t('text-default')}
          </span>
        )}
        {address?.type && (
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-heading">
            {String(address.type).toLowerCase()}
          </span>
        )}
      </div>

      <p className="text-sm text-sub-heading">
        {formatKolshiAddress(address?.address)}
      </p>

      {!isDefault && onSetDefault && (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-accent hover:underline disabled:opacity-50"
          onClick={onSetDefault}
          disabled={isSettingDefault}
        >
          {t('text-set-as-default')}
        </button>
      )}

      <div className="absolute top-4 flex space-x-2 opacity-0 group-hover:opacity-100 ltr:right-4 rtl:left-4 rtl:space-x-reverse">
        {onEdit && (
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-light"
            onClick={onEdit}
          >
            <span className="sr-only">{t('text-edit')}</span>
            <PencilIcon className="h-3 w-3" />
          </button>
        )}
        {onDelete && !isDefault && (
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-light"
            onClick={onDelete}
          >
            <span className="sr-only">{t('text-delete')}</span>
            <CloseIcon className="h-3 w-3" />
          </button>
        )}
        {checked && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-light">
            <CheckIcon className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
};

export default AddressCard;

import { useTranslation } from 'next-i18next';
import AddressCard from '@/components/address/address-card';
import { AddressHeader } from '@/components/address/address-header';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useSetDefaultAddress } from '@/framework/user';
import { AddressType } from '@/framework/utils/constants';
import type { Address } from '@/types';

interface AddressesProps {
  addresses: Address[] | undefined;
  label: string;
  className?: string;
  userId: string;
}

export const ProfileAddressGrid: React.FC<AddressesProps> = ({
  addresses,
  label,
  className,
  userId,
}) => {
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');
  const { mutate: setDefaultAddress, isLoading: isSettingDefault } =
    useSetDefaultAddress();

  function onAdd() {
    openModal('ADD_OR_UPDATE_ADDRESS', {
      customerId: userId,
      type: AddressType.Shipping,
    });
  }

  function onEdit(address: Address) {
    openModal('ADD_OR_UPDATE_ADDRESS', { customerId: userId, address });
  }

  function onDelete(address: Address) {
    openModal('DELETE_ADDRESS', { addressId: address.id });
  }

  return (
    <div className={className}>
      <AddressHeader onAdd={onAdd} count={false} label={label} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {addresses?.map((address) => (
          <AddressCard
            key={String(address.id)}
            checked={Boolean(address?.is_default)}
            address={address}
            onEdit={() => onEdit(address)}
            onDelete={() => onDelete(address)}
            onSetDefault={() => setDefaultAddress(address.id)}
            isSettingDefault={isSettingDefault}
          />
        ))}
        {!addresses?.length && (
          <span className="relative px-5 py-6 text-base text-left bg-gray-100 border rounded border-border-200">
            {t('text-no-address')}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileAddressGrid;

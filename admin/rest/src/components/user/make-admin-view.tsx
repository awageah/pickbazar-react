import { useState } from 'react';
import Button from '@/components/ui/button';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useChangeRoleMutation } from '@/data/user';
import { useTranslation } from 'next-i18next';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'store_owner', label: 'Store Owner' },
  { value: 'staff', label: 'Staff' },
  { value: 'customer', label: 'Customer' },
] as const;

type Role = (typeof ROLES)[number]['value'];

const ChangeRoleView = () => {
  const { t } = useTranslation();
  const { mutate: changeRole, isLoading: loading } = useChangeRoleMutation();
  const { data: userId } = useModalState();
  const { closeModal } = useModalAction();

  const [selectedRole, setSelectedRole] = useState<Role>('store_owner');

  function handleConfirm() {
    changeRole({ id: userId as string, role: selectedRole });
    closeModal();
  }

  return (
    <div className="m-auto flex w-full max-w-sm flex-col rounded bg-light p-6 sm:w-[28rem]">
      <h2 className="mb-4 text-base font-semibold text-heading">
        {t('text-change-role', { defaultValue: 'Change User Role' })}
      </h2>
      <p className="mb-4 text-sm text-body">
        {t('text-change-role-description', {
          defaultValue: 'Select the new role for this user.',
        })}
      </p>

      <div className="mb-6">
        <label
          htmlFor="role-select"
          className="mb-1 block text-sm font-medium text-body-dark"
        >
          {t('text-role', { defaultValue: 'Role' })}
        </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="w-full rounded border border-border-base bg-light px-4 py-2.5 text-sm text-body-dark focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={closeModal} disabled={loading}>
          {t('text-cancel')}
        </Button>
        <Button onClick={handleConfirm} loading={loading} disabled={loading}>
          {t('text-confirm', { defaultValue: 'Confirm' })}
        </Button>
      </div>
    </div>
  );
};

export default ChangeRoleView;

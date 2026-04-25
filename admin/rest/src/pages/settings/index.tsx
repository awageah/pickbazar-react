/**
 * Kolshi Platform Settings — A8.
 *
 * Dynamic key/value list fetched from GET /settings, grouped by category.
 * Each row has an inline "Edit" action that opens a drawer with a simple
 * text input for the value. The "Refresh Cache" and "Cache Stats" buttons
 * are shown at the top for super-admin convenience.
 */
import AdminLayout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  useSettingsListQuery,
  useUpdateSettingMutation,
  useRefreshCacheMutation,
  useCacheStatsQuery,
  useDeleteSettingMutation,
} from '@/data/settings';
import { KolshiSetting, SettingCategory } from '@/types';
import { useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: SettingCategory[] = [
  'FINANCIAL',
  'PLATFORM',
  'EMAIL',
  'SECURITY',
  'DELIVERY',
];

const CATEGORY_COLOR: Record<SettingCategory, string> = {
  FINANCIAL: 'bg-green-100 text-green-700',
  PLATFORM: 'bg-blue-100 text-blue-700',
  EMAIL: 'bg-yellow-100 text-yellow-700',
  SECURITY: 'bg-red-100 text-red-700',
  DELIVERY: 'bg-purple-100 text-purple-700',
};

// ── Inline edit drawer ────────────────────────────────────────────────────────

function EditDrawer({
  setting,
  onClose,
}: {
  setting: KolshiSetting;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(setting.setting_value ?? '');
  const { mutate: updateSetting, isLoading: saving } = useUpdateSettingMutation();
  const { mutate: deleteSetting, isLoading: deleting } = useDeleteSettingMutation();

  function handleSave() {
    updateSetting(
      { key: setting.setting_key, newValue: value },
      { onSuccess: onClose },
    );
  }

  function handleDelete() {
    if (!confirm(`Delete setting "${setting.setting_key}"? This cannot be undone.`))
      return;
    deleteSetting(setting.setting_key, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-semibold text-heading">
          Edit Setting
        </h3>
        <p className="mb-4 font-mono text-sm text-accent">{setting.setting_key}</p>

        {setting.description && (
          <p className="mb-4 text-sm text-gray-500">{setting.description}</p>
        )}

        <div className="mb-2">
          <label className="mb-1 block text-xs font-medium text-gray-600 uppercase">
            Value{' '}
            <span className="normal-case text-gray-400">
              ({setting.value_type})
            </span>
          </label>
          {setting.value_type === 'BOOLEAN' ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-border-200 px-3 py-2 text-sm"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-border-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder={setting.setting_value}
            />
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>
              {t('form:button-label-save')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('form:button-label-cancel')}
            </Button>
          </div>
          {!setting.is_system && (
            <Button
              onClick={handleDelete}
              loading={deleting}
              className="border-red-400 text-red-500"
              variant="outline"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Settings category group ───────────────────────────────────────────────────

function CategoryGroup({
  category,
  items,
  onEdit,
}: {
  category: SettingCategory;
  items: KolshiSetting[];
  onEdit: (s: KolshiSetting) => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <Badge
          text={category}
          color={CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-600'}
          className="text-xs font-bold uppercase"
        />
        <span className="text-sm text-gray-400">{items.length} setting(s)</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Key
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Value
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">
                Type
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">
                Description
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-200">
            {items.map((s) => (
              <tr key={s.setting_key} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-mono text-xs text-body">
                  {s.setting_key}
                  {s.is_system && (
                    <span className="ms-1.5 rounded bg-gray-100 px-1 py-0.5 text-[10px] text-gray-500">
                      system
                    </span>
                  )}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-heading">
                  {s.setting_value}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {s.value_type}
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {s.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(s)}
                    className="text-accent hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useTranslation();
  const [editTarget, setEditTarget] = useState<KolshiSetting | null>(null);

  const { settings, loading, error } = useSettingsListQuery({ size: 200 });
  const { stats } = useCacheStatsQuery();
  const { mutate: refreshCache, isLoading: refreshing } = useRefreshCacheMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  // Group settings by category in defined order
  const grouped: Partial<Record<SettingCategory, KolshiSetting[]>> = {};
  for (const cat of CATEGORY_ORDER) {
    const items = (settings as KolshiSetting[]).filter((s) => s.category === cat);
    if (items.length) grouped[cat] = items;
  }
  // catch any uncategorised entries
  const unknown = (settings as KolshiSetting[]).filter(
    (s) => !CATEGORY_ORDER.includes(s.category as SettingCategory),
  );

  return (
    <>
      {editTarget && (
        <EditDrawer setting={editTarget} onClose={() => setEditTarget(null)} />
      )}

      {/* Header */}
      <Card className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PageHeading title={t('form:form-title-settings')} />

        <div className="flex flex-wrap items-center gap-3">
          {stats && (
            <span className="text-xs text-gray-400">
              Cache size: {(stats as any).size ?? '—'}
            </span>
          )}
          <Button
            onClick={() => refreshCache()}
            loading={refreshing}
            variant="outline"
            className="h-9 text-sm"
          >
            {refreshing ? 'Refreshing…' : '↺ Refresh Cache'}
          </Button>
        </div>
      </Card>

      {/* Settings groups */}
      {Object.entries(grouped).map(([cat, items]) => (
        <CategoryGroup
          key={cat}
          category={cat as SettingCategory}
          items={items!}
          onEdit={setEditTarget}
        />
      ))}

      {unknown.length > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-gray-500">OTHER</p>
          {unknown.map((s) => (
            <div key={s.setting_key} className="flex justify-between py-2 border-b">
              <span className="font-mono text-xs">{s.setting_key}</span>
              <span className="text-sm">{s.setting_value}</span>
              <button onClick={() => setEditTarget(s)} className="text-accent text-xs">
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {(settings as KolshiSetting[]).length === 0 && (
        <Card className="flex min-h-[200px] items-center justify-center">
          <p className="text-body">No platform settings found.</p>
        </Card>
      )}
    </>
  );
}

SettingsPage.authenticate = { permissions: adminOnly };
SettingsPage.Layout = AdminLayout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

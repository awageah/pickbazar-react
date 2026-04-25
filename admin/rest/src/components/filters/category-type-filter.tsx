import Label from '@/components/ui/label';
import Select from '@/components/ui/select/select';
import { useCategoriesQuery } from '@/data/category';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ActionMeta } from 'react-select';

type Props = {
  onCategoryFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  /** @deprecated A9 — types/groups removed */
  onTypeFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  /** @deprecated A9 — authors removed */
  onAuthorFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  /** @deprecated A9 */
  onProductTypeFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  /** @deprecated A9 — manufacturers removed */
  onManufactureFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  className?: string;
  type?: string;
  enableType?: boolean;
  enableCategory?: boolean;
  enableAuthor?: boolean;
  enableProductType?: boolean;
  enableManufacturer?: boolean;
};

export default function CategoryTypeFilter({
  onCategoryFilter,
  className,
  type,
  enableCategory,
}: Props) {
  const { locale } = useRouter();
  const { t } = useTranslation();

  const { categories, loading: categoryLoading } = useCategoriesQuery({
    limit: 999,
    language: locale,
    type,
  });

  return (
    <div
      className={cn(
        'flex w-full flex-col space-y-5 rtl:space-x-reverse md:flex-row md:items-end md:space-x-5 md:space-y-0',
        className,
      )}
    >
      {enableCategory ? (
        <div className="w-full">
          <Label>{t('common:filter-by-category')}</Label>
          <Select
            options={categories}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder={t('common:filter-by-category-placeholder')}
            isLoading={categoryLoading}
            onChange={onCategoryFilter}
            isClearable={true}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

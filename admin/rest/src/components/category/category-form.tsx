import Input from '@/components/ui/input';
import { Control, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { EditIcon } from '@/components/icons/edit';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { useState } from 'react';
import { Category } from '@/types';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { categoryValidationSchema } from './category-validation-schema';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/data/category';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

/** Extracts a URL string from a Cloudinary Attachment or a plain string. */
function extractImageUrl(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.original ?? value.secure_url ?? value.thumbnail;
}

function SelectParentCategory({
  control,
  initialValue,
}: {
  control: Control<FormValues>;
  initialValue?: Category;
}) {
  const { t } = useTranslation();
  const { categories, loading } = useCategoriesQuery({
    limit: 999,
    ...(Boolean(initialValue?.id) && { self: initialValue?.id }),
  });
  return (
    <div>
      <Label>{t('form:input-label-parent-category')}</Label>
      <SelectInput
        name="parent"
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        options={categories}
        isClearable={true}
        isLoading={loading}
      />
    </div>
  );
}

type FormValues = {
  name: string;
  slug: string;
  description: string;
  parent: any;
  image: any;
};

const defaultValues: FormValues = {
  image: undefined,
  name: '',
  slug: '',
  description: '',
  parent: null,
};

type IProps = {
  initialValues?: Category | undefined;
};

export default function CreateOrUpdateCategoriesForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);

  const isSlugEditable = router?.query?.action === 'edit';

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          name: initialValues.name ?? '',
          slug: initialValues.slug ?? '',
          description: (initialValues as any).description ?? (initialValues as any).details ?? '',
          image: (initialValues as any).image ?? undefined,
          parent: initialValues.parent ? { id: initialValues.parent } : null,
        }
      : defaultValues,
    resolver: yupResolver(categoryValidationSchema) as any,
  });

  const slugAutoSuggest = formatSlug(watch('name'));

  const { mutate: createCategory, isLoading: creating } = useCreateCategoryMutation();
  const { mutate: updateCategory, isLoading: updating } = useUpdateCategoryMutation();

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug || slugAutoSuggest,
      description: values.description,
      image: extractImageUrl(values.image),
      parent_id: values.parent?.id ?? null,
    };

    if (!initialValues) {
      createCategory(payload);
    } else {
      updateCategory({ id: initialValues.id!, ...payload });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:category-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>

      {/* ── Details ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          }
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          {isSlugEditable ? (
            <div className="relative mb-5">
              <Input
                label={t('form:input-label-slug')}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <button
                className="absolute top-[27px] right-px z-0 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                type="button"
                title={t('common:text-edit')}
                onClick={() => setIsSlugDisable(false)}
              >
                <EditIcon width={14} />
              </button>
            </div>
          ) : (
            <Input
              label={t('form:input-label-slug')}
              {...register('slug')}
              value={slugAutoSuggest}
              variant="outline"
              className="mb-5"
              disabled
            />
          )}

          <TextArea
            label={t('form:input-label-details')}
            {...register('description')}
            variant="outline"
            className="mb-5"
          />

          <SelectParentCategory control={control} initialValue={initialValues} />
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="text-sm me-4 md:text-base"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}
          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update-category')
              : t('form:button-label-add-category')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}

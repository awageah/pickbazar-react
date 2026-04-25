import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, FormProvider } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Radio from '@/components/ui/radio/radio';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { productValidationSchema } from '@/components/product/product-validation-schema';
import ProductCategoryInput from '@/components/product/product-category-input';
import { Product, ProductStatus } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState } from 'react';
import {
  getProductDefaultValues,
  getProductInputValues,
  ProductFormValues,
} from '@/components/product/form-utils';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/data/product';
import { isEmpty } from 'lodash';
import { EditIcon } from '@/components/icons/edit';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { UpdateIcon } from '@/components/icons/update';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { formatSlug } from '@/utils/use-slug';
import Link from 'next/link';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';
import cn from 'classnames';

type ProductFormProps = {
  initialValues?: Product | null;
};

const STATUS_OPTIONS = [
  { label: 'form:input-label-published', id: 'published', value: ProductStatus.Publish },
  { label: 'form:input-label-draft', id: 'draft', value: ProductStatus.Draft },
];

export default function CreateOrUpdateProductForm({ initialValues }: ProductFormProps) {
  const router = useRouter();
  const { query } = router;
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const { data: shopData } = useShopQuery(
    { slug: router.query.shop as string },
    { enabled: !!router.query.shop },
  );
  const shopId = shopData?.id;

  const isSlugEditable = router?.query?.action === 'edit';
  const showPreviewButton =
    router?.query?.action === 'edit' && Boolean(initialValues?.slug);

  const methods = useForm<ProductFormValues>({
    resolver: yupResolver(productValidationSchema) as any,
    defaultValues: getProductDefaultValues(initialValues),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const { mutate: createProduct, isLoading: creating } = useCreateProductMutation();
  const { mutate: updateProduct, isLoading: updating } = useUpdateProductMutation();

  const onSubmit = (values: ProductFormValues) => {
    const payload = getProductInputValues(values, shopId, initialValues);

    if (!initialValues) {
      createProduct(payload);
    } else {
      updateProduct({ id: initialValues.id!, ...payload });
    }
  };

  const productName = watch('name');
  const slugAutoSuggest = formatSlug(productName ?? '');

  return (
    <>
      {errorMessage && (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ── Primary image ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:featured-image-title')}
              details={t('form:featured-image-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="image" control={control} multiple={false} />
            </Card>
          </div>

          {/* ── Gallery images ────────────────────────────────────────────── */}
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:gallery-title')}
              details={t('form:gallery-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="gallery" control={control} />
            </Card>
          </div>

          {/* ── Category ─────────────────────────────────────────────────── */}
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:input-label-categories')}
              details={t('form:categories-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <ProductCategoryInput control={control} setValue={setValue} />
            </Card>
          </div>

          {/* ── Product info ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:item-description')}
              details={
                initialValues
                  ? t('form:item-description-edit')
                  : t('form:item-description-add')
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t('form:input-label-name')}*`}
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

              <Input
                label={`${t('form:input-label-unit')}*`}
                {...register('unit')}
                error={t(errors.unit?.message!)}
                variant="outline"
                className="mb-5"
              />

              <Input
                label={t('form:input-label-brand')}
                {...register('brand')}
                variant="outline"
                className="mb-5"
              />

              <RichTextEditor
                title={t('form:input-label-description')}
                control={control}
                name="description"
                error={t(errors?.description?.message ?? '')}
              />

              <div className="mt-5">
                <Label>{t('form:input-label-status')}</Label>
                {STATUS_OPTIONS.map((status) => (
                  <Radio
                    key={status.id}
                    {...register('status')}
                    label={t(status.label)}
                    id={status.id}
                    value={status.value}
                    className="mb-2"
                  />
                ))}
                {errors.status?.message && (
                  <p className="my-2 text-xs text-red-500">
                    {t(errors.status.message!)}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* ── Pricing & inventory ──────────────────────────────────────── */}
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:form-title-simple-product-info')}
              details={
                initialValues
                  ? t('form:item-description-edit')
                  : t('form:item-description-add')
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t('form:input-label-price')}*`}
                {...register('price')}
                type="number"
                error={t(errors.price?.message!)}
                variant="outline"
                className="mb-5"
              />
              <Input
                label={t('form:input-label-sale-price')}
                type="number"
                {...register('sale_price')}
                error={t(errors.sale_price?.message!)}
                variant="outline"
                className="mb-5"
              />
              <Input
                label={`${t('form:input-label-quantity')}*`}
                type="number"
                {...register('quantity')}
                error={t(errors.quantity?.message!)}
                variant="outline"
                className="mb-5"
              />
              <Input
                label={t('form:input-label-sku')}
                {...register('sku')}
                error={t(errors.sku?.message!)}
                variant="outline"
                className="mb-5"
              />
            </Card>
          </div>

          {/* ── Footer actions ────────────────────────────────────────────── */}
          <StickyFooterPanel className="z-0">
            <div
              className={cn(
                'flex items-center',
                initialValues ? 'justify-between' : 'justify-end',
              )}
            >
              {initialValues && (
                <Button
                  variant="custom"
                  onClick={router.back}
                  className="!px-0 text-sm !text-body me-4 hover:!text-accent focus:ring-0 md:text-base"
                  type="button"
                  size="medium"
                >
                  <LongArrowPrev className="w-4 h-5 me-2" />
                  {t('form:button-label-back')}
                </Button>
              )}

              <div className="flex items-center">
                {showPreviewButton && (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_SHOP_URL}/products/preview/${query.productSlug}`}
                    target="_blank"
                    className="inline-flex h-12 flex-shrink-0 items-center justify-center rounded border !border-accent bg-transparent px-5 py-0 text-sm font-semibold leading-none !text-accent outline-none transition duration-300 ease-in-out me-4 hover:border-accent hover:bg-accent hover:!text-white focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700 md:text-base"
                  >
                    <EyeIcon className="w-4 h-4 me-2" />
                    {t('form:button-label-preview-product-on-shop')}
                  </Link>
                )}
                <Button
                  loading={updating || creating}
                  disabled={updating || creating}
                  size="medium"
                  className="text-sm md:text-base"
                >
                  {initialValues ? (
                    <>
                      <UpdateIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                      <span className="sm:hidden">{t('form:button-label-update')}</span>
                      <span className="hidden sm:block">
                        {t('form:button-label-update-product')}
                      </span>
                    </>
                  ) : (
                    t('form:button-label-add-product')
                  )}
                </Button>
              </div>
            </div>
          </StickyFooterPanel>
        </form>
      </FormProvider>
    </>
  );
}

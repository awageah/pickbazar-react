import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { productClient } from './client/product';
import {
  ProductQueryOptions,
  ProductPaginator,
  Product,
  KolshiProductInput,
  KolshiProductImage,
  KolshiProductImageInput,
  KolshiVariation,
  KolshiVariationInput,
  ProductImportResult,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { Routes } from '@/config/routes';
import { normalizeApiError } from '@/utils/error-handler';

// ── Product CRUD ─────────────────────────────────────────────────────────────

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation(
    (data: KolshiProductInput) => productClient.create(data),
    {
      onSuccess: async () => {
        const shopSlug = router.query.shop as string | undefined;
        const redirectUrl = shopSlug
          ? `/${shopSlug}${Routes.product.list}`
          : Routes.product.list;
        await Router.push(redirectUrl);
        toast.success(t('common:successfully-created'));
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
    },
  );
};

export const useUpdateProductMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    (data: KolshiProductInput & { id: string | number }) =>
      productClient.update(data),
    {
      onSuccess: async (updated: Product) => {
        const shopSlug = router.query.shop as string | undefined;
        const listUrl = shopSlug
          ? `/${shopSlug}${Routes.product.list}`
          : Routes.product.list;
        await router.push(`${listUrl}/${updated?.slug}/edit`);
        toast.success(t('common:successfully-updated'));
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
    },
  );
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(productClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (err: any) => {
      toast.error(normalizeApiError(err).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
  });
};

// ── Queries ──────────────────────────────────────────────────────────────────

export const useProductQuery = ({ slug }: { slug: string; language?: string }) => {
  const { data, error, isLoading } = useQuery<Product, Error>(
    [API_ENDPOINTS.PRODUCTS, { slug }],
    () => productClient.get({ slug }),
  );

  return { product: data, error, isLoading };
};

export const useProductsQuery = (
  params: Partial<ProductQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<ProductPaginator, Error>(
    [API_ENDPOINTS.PRODUCTS, params],
    ({ queryKey, pageParam }) =>
      productClient.paginated(Object.assign({}, queryKey[1] as any, pageParam)),
    { keepPreviousData: true, ...options },
  );

  return {
    products: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

// ── Publish / unpublish ───────────────────────────────────────────────────────

export const usePublishProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation((id: string | number) => productClient.publish(id), {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(normalizeApiError(err).message);
    },
  });
};

export const useUnpublishProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation((id: string | number) => productClient.unpublish(id), {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(normalizeApiError(err).message);
    },
  });
};

// ── Product images ────────────────────────────────────────────────────────────

export const useProductImagesQuery = (productId: string | number) => {
  const { data, error, isLoading } = useQuery<KolshiProductImage[], Error>(
    [API_ENDPOINTS.PRODUCT_IMAGES, productId],
    () => productClient.getImages(productId),
    { enabled: Boolean(productId) },
  );

  return { images: data ?? [], error, isLoading };
};

export const useAddProductImageMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ productId, data }: { productId: string | number; data: KolshiProductImageInput }) =>
      productClient.addImage(productId, data),
    {
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_IMAGES, productId]);
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useSetPrimaryImageMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ imageId }: { imageId: number; productId: string | number }) =>
      productClient.setPrimaryImage(imageId),
    {
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_IMAGES, productId]);
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useDeleteProductImageMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ imageId }: { imageId: number; productId: string | number }) =>
      productClient.deleteImage(imageId),
    {
      onSuccess: (_, { productId }) => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_IMAGES, productId]);
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

// ── Product variations ────────────────────────────────────────────────────────

export const useProductVariationsQuery = (productId: string | number) => {
  const { data, error, isLoading } = useQuery<KolshiVariation[], Error>(
    [API_ENDPOINTS.PRODUCT_VARIATIONS, productId],
    () => productClient.getVariations(productId),
    { enabled: Boolean(productId) },
  );

  return { variations: data ?? [], error, isLoading };
};

export const useCreateVariationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ productId, data }: { productId: string | number; data: KolshiVariationInput }) =>
      productClient.addVariation(productId, data),
    {
      onSuccess: (_, { productId }) => {
        toast.success(t('common:successfully-created'));
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_VARIATIONS, productId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useUpdateVariationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({
      variationId,
      productId,
      data,
    }: {
      variationId: number;
      productId: string | number;
      data: KolshiVariationInput;
    }) => productClient.updateVariation(variationId, data),
    {
      onSuccess: (_, { productId }) => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_VARIATIONS, productId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useToggleVariationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ variationId }: { variationId: number; productId: string | number }) =>
      productClient.toggleVariation(variationId),
    {
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_VARIATIONS, productId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

export const useDeleteVariationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ variationId, productId }: { variationId: number; productId: string | number }) =>
      productClient.deleteVariation(variationId),
    {
      onSuccess: (_, { productId }) => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCT_VARIATIONS, productId]);
      },
      onError: (err: any) => {
        toast.error(normalizeApiError(err).message);
      },
    },
  );
};

// ── CSV import ────────────────────────────────────────────────────────────────

export const useImportProductsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation((file: File) => productClient.importProducts(file), {
    onSuccess: (result: ProductImportResult) => {
      if (result.failed === 0) {
        toast.success(`Imported ${result.imported} products successfully.`);
      } else {
        toast.warning(
          `Imported ${result.imported} products. ${result.failed} rows failed — check the error list.`,
        );
      }
      queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(normalizeApiError(err).message);
    },
  });
};

// ── Stub hooks for deleted features (compile compat until A9) ─────────────────

/** @deprecated No in-active product list in Kolshi — returns empty data. */
export const useInActiveProductsQuery = (_options: any) => ({
  products: [],
  paginatorInfo: null,
  error: null,
  loading: false,
});

/** @deprecated No low-stock analytics in Kolshi — returns empty data. */
export const useProductStockQuery = (_options: any) => ({
  products: [],
  paginatorInfo: null,
  error: null,
  loading: false,
});

/** @deprecated No flash-sale in Kolshi — returns empty data. */
export const useProductsByFlashSaleQuery = (_options: any) => ({
  products: [],
  paginatorInfo: null,
  error: null,
  loading: false,
});

/** @deprecated No AI description in Kolshi — shows unsupported toast. */
export const useGenerateDescriptionMutation = () =>
  useMutation(async () => {
    toast.error('AI description generation is not available in Kolshi.');
  });

import { Product, Category, KolshiProductInput, ProductStatus } from '@/types';

/**
 * Fields managed by the product form.
 * Kolshi does NOT have: authors, manufacturers, tags, types/groups, flash-sale,
 * digital files, external products, or video embeds.
 * Images are uploaded via Cloudinary first; the resulting URLs are stored here.
 */
export interface ProductFormValues {
  name: string;
  slug?: string;
  description?: string;
  unit?: string;
  brand?: string;
  price: number;
  sale_price?: number;
  quantity: number;
  sku?: string;
  status: string;
  /** Primary image — stored as Cloudinary secure_url string after upload. */
  image?: string | { thumbnail?: string; original?: string; [key: string]: any };
  /** Gallery images — stored as Cloudinary secure_url strings after upload. */
  gallery?: Array<string | { thumbnail?: string; original?: string; [key: string]: any }>;
  /** Category objects selected via ProductCategoryInput. */
  categories: Pick<Category, 'id' | 'name'>[];
  is_taxable?: boolean;
}

/** Extracts a plain URL from either a string or an Attachment-shaped object. */
function extractUrl(
  value: string | { thumbnail?: string; original?: string; secure_url?: string } | undefined,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.original ?? value.secure_url ?? value.thumbnail;
}

export function getProductDefaultValues(product: Product | null | undefined): ProductFormValues {
  if (!product) {
    return {
      name: '',
      slug: '',
      description: '',
      unit: '',
      brand: '',
      price: 0,
      sale_price: undefined,
      quantity: 0,
      sku: '',
      status: ProductStatus.Draft,
      image: undefined,
      gallery: [],
      categories: [],
      is_taxable: false,
    };
  }

  return {
    name: product.name ?? '',
    slug: product.slug ?? '',
    description: product.description ?? '',
    unit: product.unit ?? '',
    // @ts-ignore — brand is Kolshi-specific, not in legacy Product type
    brand: (product as any).brand ?? '',
    price: product.price ?? 0,
    sale_price: product.sale_price,
    quantity: product.quantity ?? 0,
    sku: product.sku ?? '',
    status: product.status ?? ProductStatus.Draft,
    // image comes back as a URL string from Kolshi
    image: (product as any).image ?? undefined,
    gallery: ((product as any).gallery as string[] | undefined) ?? [],
    categories: (product.categories ?? []).map((c) => ({ id: c.id, name: c.name })),
    is_taxable: product.is_taxable ?? false,
  };
}

/**
 * Maps form values to the Kolshi CreateProduct / UpdateProduct request body.
 */
export function getProductInputValues(
  values: ProductFormValues,
  shopId: string | number | undefined,
  existingProduct?: Product | null,
): KolshiProductInput {
  const imageUrl = extractUrl(values.image as any);
  const galleryUrls = (values.gallery ?? [])
    .map((g) => extractUrl(g as any))
    .filter((u): u is string => Boolean(u));

  return {
    shop_id: existingProduct ? undefined : shopId,
    name: values.name,
    description: values.description,
    unit: values.unit,
    brand: values.brand,
    price: values.price,
    sale_price: values.sale_price,
    quantity: values.quantity,
    sku: values.sku,
    status: values.status,
    image: imageUrl,
    gallery: galleryUrls.length ? galleryUrls : undefined,
    is_taxable: values.is_taxable,
    category_ids: values.categories.map((c) => c.id),
  };
}

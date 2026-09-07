import type { gallaryItem, Product } from "@/types/product";

type ApiImage = {
  id?: string | number;
  file?: string;
  image?: string;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
  file_type?: "IMAGE" | "VIDEO";
  product?: string;
};

type RawProduct = Partial<Product> & {
  id: string;
  sku?: string | null;
  product_sku?: string | null;
  item_sku?: string | null;
  image?: string | null;
  images?: ApiImage[];
  gallery?: ApiImage[];
  overview_image?: string | null;
  overview_image_url?: string | null;
  overview_image_ar?: string | null;
  long_image?: string | null;
  detail_image?: string | null;
};

function firstUrl(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function resolveSku(raw: RawProduct): string | null {
  const fromApi = firstUrl(raw.sku, raw.product_sku, raw.item_sku);
  if (fromApi) return fromApi;
  if (raw.id == null || raw.id === "") return null;
  return `BM-${String(raw.id)}`;
}

function toGalleryItem(item: ApiImage, index: number, productId: string): gallaryItem {
  return {
    id: String(item.id ?? index),
    product: item.product ?? productId,
    file: item.file ?? item.image ?? "",
    alt_text: item.alt_text ?? null,
    display_order: item.display_order ?? index,
    is_primary: item.is_primary ?? index === 0,
    file_type: item.file_type ?? "IMAGE"
  };
}

function deriveHasDiscount(product: RawProduct): boolean {
  if (typeof product.has_discount === "boolean") return product.has_discount;
  const base = Number.parseFloat(product.base_price ?? "");
  const sale = Number.parseFloat(product.discount_price ?? "");
  return Number.isFinite(base) && Number.isFinite(sale) && sale < base;
}

/** Maps the live backend product payload onto the frontend Product type. */
export function normalizeProduct(raw: RawProduct): Product {
  const thumbnail = raw.thumbnail ?? raw.image ?? null;
  const source = Array.isArray(raw.gallery)
    ? raw.gallery
    : Array.isArray(raw.images)
      ? raw.images
      : [];
  const gallery = source
    .map((item, index) => toGalleryItem(item, index, String(raw.id)))
    .filter((item) => item.file);

  const overviewImage =
    firstUrl(
      raw.overview_image_url,
      raw.overview_image,
      raw.long_image,
      raw.detail_image
    );

  return {
    ...(raw as Product),
    thumbnail,
    gallery,
    has_discount: deriveHasDiscount(raw),
    sku: resolveSku(raw),
    overview_image: overviewImage,
    overview_image_url: overviewImage,
    overview_image_ar: firstUrl(raw.overview_image_ar) ?? null,
  };
}

export function normalizeProducts(raw: unknown): Product[] {
  if (Array.isArray(raw)) return raw.map((item) => normalizeProduct(item as RawProduct));
  if (raw && typeof raw === "object" && "results" in raw) {
    const results = (raw as { results: unknown }).results;
    if (Array.isArray(results)) return results.map((item) => normalizeProduct(item as RawProduct));
  }
  return [];
}

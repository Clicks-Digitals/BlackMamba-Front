import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getProduct } from "@/features/single-product";
import { buildProductHref } from "@/lib/utils";

/**
 * Metadata for the legacy flat product URL. The canonical always points at the
 * category path, so even while this URL is reachable it never competes with
 * the real one in search results.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [res, locale] = await Promise.all([getProduct(slug), getLocale()]);

  if (!res.ok) return { title: "Product Not Found" };

  const product = res.data;
  const isAr = locale === "ar";

  const name = (isAr && product.name_ar) || product.name;
  const title = (isAr ? product.meta_title_ar : product.meta_title) || name;
  const description =
    (isAr ? product.meta_description_ar : product.meta_description) ||
    ((isAr && product.description_ar) || product.description) ||
    undefined;
  const keywords = (isAr ? product.meta_keywords_ar : product.meta_keywords) || undefined;
  const ogImage = product.og_image || product.thumbnail || undefined;
  const canonical =
    product.canonical_url || buildProductHref(product.category_path, product.slug);

  const [robotsIndex, robotsFollow] = (product.meta_robots || "index,follow").split(",");

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: robotsIndex === "index", follow: robotsFollow === "follow" },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

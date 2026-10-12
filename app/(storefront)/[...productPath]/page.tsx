import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SingleProductFeature, getProduct } from "@/features/single-product";
import { buildProductHref, RESERVED_SEGMENTS } from "@/lib/utils";
import { getCategorySlugs } from "@/features/categories/actions/category-slugs";

/**
 * Products served under their category trail, e.g.
 *   /peripheral-accessories/memory-cards/sandisk-extreme-microsdxc-512gb
 *
 * The last segment is the product slug, which is unique on its own — the
 * leading segments are there for readers and for search engines. If they don't
 * match the product's current categories (because it moved, or someone typed a
 * different trail), we send a permanent redirect to the canonical path rather
 * than serving the same page at two URLs.
 *
 * Static routes such as /cart and /checkout take priority over this catch-all,
 * so it only sees paths nothing else claimed.
 */
interface CatchAllProps {
  params: Promise<{ productPath: string[] }>;
}

function slugFrom(segments: string[]): string | null {
  if (segments.length < 2) return null; // a bare /something is not a product URL
  if (RESERVED_SEGMENTS.has(segments[0])) return null;
  return segments[segments.length - 1] ?? null;
}

/**
 * Only claim a path whose first segment is a real category. Without this the
 * catch-all would answer for every unmatched URL on the site, turning what
 * should be a hard 404 into a page render.
 */
async function looksLikeProductPath(segments: string[]): Promise<boolean> {
  if (slugFrom(segments) === null) return false;
  const slugs = await getCategorySlugs();
  // An empty set means the category request failed — fall through to the
  // product lookup rather than 404-ing the whole catalogue.
  return slugs.size === 0 || slugs.has(segments[0]);
}

export async function generateMetadata({ params }: CatchAllProps): Promise<Metadata> {
  const { productPath } = await params;
  const slug = slugFrom(productPath);
  if (!slug) return { title: "Page not found" };

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

export default async function ProductByCategoryPage({ params }: CatchAllProps) {
  const { productPath } = await params;
  const slug = slugFrom(productPath);
  if (!slug || !(await looksLikeProductPath(productPath))) notFound();

  const res = await getProduct(slug);
  if (!res.ok) notFound();

  const canonical = buildProductHref(res.data.category_path, res.data.slug);
  const requested = `/${productPath.join("/")}`;
  if (requested !== canonical) permanentRedirect(canonical);

  return <SingleProductFeature productSlug={slug} />;
}

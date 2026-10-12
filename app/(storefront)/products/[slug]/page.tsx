import { notFound, permanentRedirect } from "next/navigation";
import { getProduct } from "@/features/single-product";
import { buildProductHref } from "@/lib/utils";

/**
 * The old flat product URL.
 *
 * Products now live under their category trail, so this only exists to carry
 * the links already out in the world — and Google's index — across to the new
 * path with a 301. A product with no category has no trail to move to, so it
 * is still served here.
 */
interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const res = await getProduct(slug);
  if (!res.ok) notFound();

  const canonical = buildProductHref(res.data.category_path, res.data.slug);
  if (canonical !== `/products/${slug}`) permanentRedirect(canonical);

  // No category: this flat path is the canonical one.
  const { SingleProductFeature } = await import("@/features/single-product");
  return <SingleProductFeature productSlug={slug} />;
}

export { generateMetadata } from "./metadata";

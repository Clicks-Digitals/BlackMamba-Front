import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { SingleProductFeature, getProduct } from "@/features/single-product";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [res, locale] = await Promise.all([getProduct(slug), getLocale()]);

  if (!res.ok) {
    return { title: "Product Not Found" };
  }

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
  const canonical = product.canonical_url || `/products/${product.slug}`;

  const [robotsIndex, robotsFollow] = (product.meta_robots || "index,follow").split(",");

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: robotsIndex === "index",
      follow: robotsFollow === "follow",
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <SingleProductFeature productSlug={slug} />;
}

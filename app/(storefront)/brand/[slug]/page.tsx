import type { Metadata } from "next";
import { BrandStoreFeature, getBrandBySlugAction } from "@/features/brand";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlugAction(slug);
  return { title: brand?.name ?? "Brand" };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  return <BrandStoreFeature slug={slug} />;
}

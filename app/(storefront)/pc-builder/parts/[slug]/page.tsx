import type { Metadata } from "next";
import { getPartBySlugAction } from "@/features/pc-builder/actions/queries";
import { PartSingleProductFeature } from "@/features/pc-builder/components/PartSingleProductFeature";

interface PartDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PartDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const part = await getPartBySlugAction(slug);
  return { title: part?.name ?? "Part" };
}

export default async function PartDetailPage({ params }: PartDetailPageProps) {
  const { slug } = await params;
  return <PartSingleProductFeature partSlug={slug} />;
}

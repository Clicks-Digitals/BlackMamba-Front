import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSharedBuildAction } from "@/features/pc-builder";
import { SharedBuildView } from "@/features/pc-builder/components/SharedBuildView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PCBuilder.shared");
  return { title: t("badge") };
}

interface SharedBuildPageProps {
  params: Promise<{ shareSlug: string }>;
}

export default async function SharedBuildPage({ params }: SharedBuildPageProps) {
  const { shareSlug } = await params;
  const build = await getSharedBuildAction(shareSlug);

  if (!build) notFound();

  return <SharedBuildView build={build} shareSlug={shareSlug} />;
}

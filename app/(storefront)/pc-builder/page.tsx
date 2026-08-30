import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getOrCreateBuildAction, BuilderView } from "@/features/pc-builder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PCBuilder");
  return { title: t("title") };
}

export default async function BuilderPage() {
  const build = await getOrCreateBuildAction();
  return <BuilderView initialBuild={build} />;
}

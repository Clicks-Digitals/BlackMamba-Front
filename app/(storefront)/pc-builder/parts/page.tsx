import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getOrCreateBuildAction } from "@/features/pc-builder";
import { searchPartsAction } from "@/features/pc-builder/actions/queries";
import { PartsCatalogueView } from "@/features/pc-builder/components/PartsCatalogueView";
import { SLOT_ORDER, type PCSlot } from "@/features/pc-builder/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PCBuilder.catalogue");
  return { title: t("title") };
}

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const slot = (SLOT_ORDER as string[]).includes(sp.slot ?? "") ? (sp.slot as PCSlot) : "ALL";

  let buildId = "";
  try {
    const build = await getOrCreateBuildAction();
    buildId = build.id;
  } catch {
    // Parts page works without an active build — no compatibility badges shown
  }

  const initial = await searchPartsAction(
    {
      slot: slot === "ALL" ? undefined : slot,
      search: sp.search,
      ...(buildId ? { compatible_with: buildId } : {}),
    },
    1
  );

  return (
    <PartsCatalogueView
      buildId={buildId}
      initialParts={initial.results}
      initialCount={initial.count}
      initialSlot={slot}
    />
  );
}

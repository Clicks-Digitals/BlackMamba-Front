import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrCreateBuildAction, getPartBySlugAction, searchPartsAction } from "@/features/pc-builder/actions/queries";
import { SLOT_ICONS } from "./slot-icons";
import { PartDetailView } from "./PartDetailView";

export async function PartSingleProductFeature({ partSlug }: { partSlug: string }) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const t = await getTranslations("PCBuilder");
  const tDetail = await getTranslations("PCBuilder.detail");

  let buildId = "";
  try {
    buildId = (await getOrCreateBuildAction()).id;
  } catch {
    // Part page works without an active build — no compatibility info shown
  }

  const part = await getPartBySlugAction(partSlug, buildId || undefined);
  if (!part) notFound();

  const otherOptions = part.spec
    ? (
        await searchPartsAction(
          { slot: part.spec.slot, ...(buildId ? { compatible_with: buildId } : {}) },
          1
        )
      ).results.filter((p) => p.id !== part.id)
    : [];

  const slot = part.spec?.slot;
  const partName = isAr && part.name_ar ? part.name_ar : part.name;
  const SlotIcon = slot ? SLOT_ICONS[slot] : null;

  return (
    <div className="bg-[#0B0F0E]">
      {/* ── Breadcrumb — Black Mamba dark chrome ── */}
      <div className="layout-gutter-x border-b border-[#26292C]">
        <nav
          className="layout-page flex h-11 items-center gap-1.5 font-chillax text-xs text-white/40"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-[#EDEFF0]">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0" />
          <Link href="/pc-builder" className="transition-colors hover:text-[#EDEFF0]">
            {isAr ? "بناء PC" : "Build Your PC"}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0" />
          <Link href="/pc-builder/parts" className="transition-colors hover:text-[#EDEFF0]">
            {isAr ? "تصفح القطع" : "Browse Parts"}
          </Link>
          <ChevronRight size={12} strokeWidth={2} className="shrink-0" />
          <span className="max-w-50 truncate font-medium text-[#EDEFF0]">{partName}</span>
        </nav>
      </div>

      {/* ── Main section ── */}
      <div className="layout-page layout-gutter-x py-4 md:py-6">
        <div className="grid gap-5 lg:grid-cols-[45fr_55fr] lg:items-start lg:gap-10">
          {/* Left: dark image panel — PCPart has no gallery array, only thumbnail */}
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-[#26292C] bg-[#17181B]">
              {part.thumbnail ? (
                <Image src={part.thumbnail} alt={partName} fill className="object-contain p-10" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center">
                  {SlotIcon && <SlotIcon className="h-20 w-20 text-white/15" />}
                </div>
              )}
            </div>
          </div>

          {/* Right: interactive actions panel (client component) */}
          <PartDetailView part={part} buildId={buildId} />
        </div>
      </div>

      {/* ── Other options ── */}
      {otherOptions.length > 0 && slot && (
        <div className="border-t border-[#26292C]">
          <div className="layout-page layout-gutter-x py-8">
            <h2
              className={cn(
                "mb-4 text-[#EDEFF0]",
                isAr ? "font-cairo text-xl font-bold" : "font-chillax text-2xl uppercase tracking-wide"
              )}
            >
              {tDetail("otherOptions", { slot: t(`slots.${slot}`) })}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherOptions.map((opt) => {
                const optName = isAr && opt.name_ar ? opt.name_ar : opt.name;
                const optPrice = opt.price ?? opt.base_price;
                return (
                  <Link
                    key={opt.id}
                    href={`/pc-builder/parts/${opt.slug}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-[#26292C] bg-[#17181B] p-4 transition-colors hover:border-[#9e1d20]/30",
                      opt.is_compatible === false && "opacity-50"
                    )}
                  >
                    {opt.thumbnail && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0B0F0E]">
                        <Image
                          src={opt.thumbnail}
                          alt={optName}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm font-medium text-[#EDEFF0]">{optName}</span>
                    <span className="shrink-0 font-bold text-[#9e1d20]">
                      {optPrice ? `${Number(optPrice).toFixed(2)} JOD` : "—"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared";
import type { HomeSection } from "../types";

type Props = {
  sections: HomeSection[];
  locale: string;
  startIndex?: number;
};

export function HomeProductSections({ sections, locale, startIndex = 0 }: Props) {
  const t = useTranslations("Home");
  const rtl = locale === "ar";
  const active = sections
    .filter((s) => s.is_active && s.products?.length)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!active.length) return null;

  return (
    <>
      {active.map((section, index) => {
        const title = rtl ? section.title_ar || section.title : section.title;
        const band = (startIndex + index) % 2 === 1;

        return (
          <section
            key={section.id}
            className={cn(
              "relative",
              band
                ? "left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-[#121314] py-10 sm:py-14"
                : "layout-section-y"
            )}
          >
            <div className="layout-page layout-gutter-x">
              <RowHeader title={title} rtl={rtl} viewMoreLabel={t("viewMore")} />

              <div className="mt-8 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {section.products.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

function RowHeader({
  title,
  rtl,
  viewMoreLabel,
}: {
  title: string;
  rtl: boolean;
  viewMoreLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div>
        <p className="bm-kicker mb-2">{rtl ? "مجموعة" : "Collection"}</p>
        <h2
        className={cn(
          "leading-none text-foreground",
          "text-[clamp(1.35rem,2.6vw,2.1rem)]",
          !rtl && "font-chillax tracking-wide uppercase",
          rtl && "font-cairo font-semibold"
        )}
      >
        {title}
        </h2>
      </div>
      <Link
        href="/products"
        onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
        className={cn(
          "inline-flex shrink-0 items-center rounded-md border border-white/12 px-4 py-1.5 text-sm font-semibold text-white/70 transition-colors duration-200 hover:border-primary/40 hover:text-white",
          rtl && "font-cairo"
        )}
      >
        {viewMoreLabel}
      </Link>
    </div>
  );
}

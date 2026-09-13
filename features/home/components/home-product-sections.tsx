"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { GalleryHorizontal, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared";
import type { HomeSection } from "../types";
import { HomeSlider } from "./home-slider";

type LayoutMode = "grid" | "swiper";

type Props = {
  sections: HomeSection[];
  locale: string;
  startIndex?: number;
  /** Rendered between product sections (after the first by default). */
  betweenSlot?: ReactNode;
  /** 0-based index after which `betweenSlot` is inserted. Default: 0 (after first section). */
  betweenAfterIndex?: number;
};

export function HomeProductSections({
  sections,
  locale,
  startIndex = 0,
  betweenSlot,
  betweenAfterIndex = 0,
}: Props) {
  const t = useTranslations("Home");
  const rtl = locale === "ar";
  const active = sections
    .filter((s) => s.is_active && s.products?.length)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Alternate showcase: 2nd, 4th, … sections open as swiper
  const [layouts, setLayouts] = useState<Record<string, LayoutMode>>(() => {
    const initial: Record<string, LayoutMode> = {};
    active.forEach((section, index) => {
      initial[section.id] = index % 2 === 1 ? "swiper" : "grid";
    });
    return initial;
  });

  if (!active.length) return null;

  function setLayout(id: string, mode: LayoutMode) {
    setLayouts((prev) => ({ ...prev, [id]: mode }));
  }

  return (
    <>
      {active.map((section, index) => {
        const title = rtl ? section.title_ar || section.title : section.title;
        const band = (startIndex + index) % 2 === 1;
        const layout = layouts[section.id] ?? (index % 2 === 1 ? "swiper" : "grid");

        return (
          <div key={section.id}>
            <section
              className={cn(
                "relative",
                band
                  ? "left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-muted/50 py-8 sm:py-10"
                  : index === 0
                    ? "pt-5 pb-[clamp(1.75rem,3.5vw,3.25rem)] sm:pt-6"
                    : "layout-section-y"
              )}
            >
              <div className="layout-page layout-gutter-x">
                <RowHeader
                  title={title}
                  rtl={rtl}
                  viewMoreLabel={t("viewMore")}
                  layout={layout}
                  onLayoutChange={(mode) => setLayout(section.id, mode)}
                  layoutGridLabel={t("layoutGrid")}
                  layoutSwiperLabel={t("layoutSwiper")}
                />

                {layout === "grid" ? (
                  <div className="mt-4 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {section.products.map((product) => (
                      <ProductCard key={product.id} product={product} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <HomeSlider
                      rtl={rtl}
                      autoPlay={false}
                      loop={section.products.length > 5}
                      arrowVariant="light"
                      itemClassName="basis-[78%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          locale={locale}
                          className="w-full"
                        />
                      ))}
                    </HomeSlider>
                  </div>
                )}
              </div>
            </section>

            {betweenSlot && index === betweenAfterIndex ? betweenSlot : null}
          </div>
        );
      })}
    </>
  );
}

function RowHeader({
  title,
  rtl,
  viewMoreLabel,
  layout,
  onLayoutChange,
  layoutGridLabel,
  layoutSwiperLabel,
}: {
  title: string;
  rtl: boolean;
  viewMoreLabel: string;
  layout: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  layoutGridLabel: string;
  layoutSwiperLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2
          className={cn(
            "store-heading",
            !rtl && "font-chillax",
            rtl && "font-cairo"
          )}
        >
          {title}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="inline-flex h-9 items-center rounded-md border border-border bg-card p-0.5"
          role="group"
          aria-label={rtl ? "تخطيط المنتجات" : "Product layout"}
        >
          <button
            type="button"
            onClick={() => onLayoutChange("grid")}
            aria-pressed={layout === "grid"}
            title={layoutGridLabel}
            aria-label={layoutGridLabel}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors",
              layout === "grid"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("swiper")}
            aria-pressed={layout === "swiper"}
            title={layoutSwiperLabel}
            aria-label={layoutSwiperLabel}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors",
              layout === "swiper"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GalleryHorizontal className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <Link
          href="/products"
          onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          className={cn(
            "store-view-all inline-flex shrink-0 items-center gap-0.5",
            rtl && "font-cairo"
          )}
        >
          {viewMoreLabel}
        </Link>
      </div>
    </div>
  );
}

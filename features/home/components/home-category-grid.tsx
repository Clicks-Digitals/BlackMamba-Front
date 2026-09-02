"use client";

import Link from "next/link";
import { CategoryCard } from "@/components/shared";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { HomeSlider } from "./home-slider";

type Props = {
  categories: Category[];
  locale: string;
  title: string;
  viewAllLabel: string;
  exploreLabel: string;
};

export function HomeCategoryGrid({
  categories,
  locale,
  title,
  viewAllLabel,
  exploreLabel,
}: Props) {
  if (!categories.length) return null;

  const rtl = locale === "ar";
  const items = categories.slice(0, 12);

  return (
    <section className="pt-6 pb-3 sm:pt-8 sm:pb-4">
      <div className="layout-page layout-gutter-x">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <p className="bm-kicker mb-1.5">{rtl ? "اكتشف" : "Discover"}</p>
            <h2
              className={cn(
                "leading-none font-semibold text-foreground",
                "text-[clamp(1.65rem,3.2vw,2.5rem)]",
                !rtl && "font-chillax tracking-wide",
                rtl && "font-cairo font-semibold"
              )}
            >
              {title}
            </h2>
          </div>
          <Link
            href="/categories"
            className={cn(
              "hidden shrink-0 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors duration-200 hover:border-primary/40 hover:text-foreground sm:inline-flex",
              rtl && "font-cairo"
            )}
          >
            {viewAllLabel}
          </Link>
        </div>

        <HomeSlider
          rtl={rtl}
          autoPlay={false}
          loop={items.length > 5}
          arrowVariant="light"
          itemClassName="basis-[78%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
        >
          {items.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              locale={locale}
              exploreLabel={exploreLabel}
              className="aspect-4/5 w-full max-h-[17.5rem] sm:max-h-[18.5rem]"
            />
          ))}
        </HomeSlider>

        <div className="mt-4 flex justify-center sm:hidden">
          <Link
            href="/categories"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground/80 transition-colors duration-200 hover:border-primary/40 hover:text-foreground",
              rtl && "font-cairo"
            )}
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

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
        <div className="mb-4 flex items-center justify-between gap-4">
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
          <Link
            href="/categories"
            className={cn(
              "store-view-all hidden shrink-0 sm:inline-flex",
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
              "inline-flex h-9 items-center justify-center rounded-[4px] border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-colors duration-150 hover:border-primary/50",
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

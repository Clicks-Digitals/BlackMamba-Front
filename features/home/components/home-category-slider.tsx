"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CategoryCard } from "@/components/shared";
import type { Category } from "@/types/category";
import { HomeSlider } from "./home-slider";

type Props = {
  categories: Category[];
  locale: string;
  title: string;
  exploreLabel: string;
  viewAllLabel: string;
};

export function HomeCategorySlider({ categories, locale, title, exploreLabel, viewAllLabel }: Props) {
  if (!categories.length) return null;
  const rtl = locale === "ar";

  return (
    <section className="layout-section-y layout-gutter-x w-full">
      <div className="layout-page">
        {/* Left-aligned heading with amber rule */}
        <h2
          className={cn(
            "flex items-center gap-3 text-[clamp(2.25rem,4.2vw,3rem)] leading-none text-foreground uppercase",
            !rtl && "font-chillax",
            rtl && "font-cairo font-semibold normal-case"
          )}
        >
          <span className="h-1 w-9 shrink-0 rounded-full bg-primary" aria-hidden />
          {title}
        </h2>

        {/* Slider of category cards */}
        <div className="mt-10 lg:mt-12">
          <HomeSlider rtl={rtl}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                locale={locale}
                exploreLabel={exploreLabel}
              />
            ))}
          </HomeSlider>
        </div>

        {/* View All button */}
        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href="/categories"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#d12f27]"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

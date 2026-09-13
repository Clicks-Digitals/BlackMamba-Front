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
            "store-heading",
            !rtl && "font-chillax",
            rtl && "font-cairo"
          )}
        >
          {title}
        </h2>

        <div className="mt-4">
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
        <div className="mt-6 flex justify-center">
          <Link
            href="/categories"
            className="store-view-all inline-flex h-9 items-center justify-center text-[13px]"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

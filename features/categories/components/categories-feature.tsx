"use client";

import { useState } from "react";
import { InfiniteScroll } from "@/components/shared";
import { getAllCategories } from "../actions/queries";
import { CategoriesGrid } from "./categories-grid";
import { EmptyCategories } from "./empty-categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoriesFeatureProps {
  locale: string;
  pageTitle: string;
  exploreLabel: string;
  emptyMessage: string;
  endOfListMessage: string;
}

export function CategoriesFeature({
  locale,
  pageTitle,
  exploreLabel,
  emptyMessage,
  endOfListMessage,
}: CategoriesFeatureProps) {
  const [filters] = useState({ is_active: "true", parent: "none" });
  const rtl = locale === "ar";

  return (
    <div className="min-h-screen bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-10 md:py-14">
          <p className="bm-kicker mb-3">
            {rtl ? "تصفح" : "Browse"}
          </p>
          <h1
            className={cn(
              "leading-none text-white",
              !rtl && "font-beckman uppercase tracking-wide text-[clamp(2.4rem,5vw,4rem)]",
              rtl && "font-cairo font-bold text-[clamp(1.8rem,4.2vw,3.2rem)]"
            )}
          >
            {pageTitle}
          </h1>
          <p className={cn("mt-3 max-w-md text-[15px] text-white/45", rtl && "font-cairo")}>
            {rtl ? "اختر الفئة التي تناسبك" : "Find exactly what you're looking for"}
          </p>
        </div>
      </div>

      <div className="layout-page layout-gutter-x py-10 md:py-14">
        <InfiniteScroll<Category>
          fetchAction={getAllCategories}
          filters={filters}
          emptyState={<EmptyCategories message={emptyMessage} />}
          endMessage={endOfListMessage}
          loadingUI={
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-4/3 w-full animate-pulse rounded-lg bg-white/6" />
              ))}
            </div>
          }
        >
          {(categories) => (
            <div>
              <CategoriesGrid
                categories={categories}
                locale={locale}
                exploreLabel={exploreLabel}
              />
            </div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}

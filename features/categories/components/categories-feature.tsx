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
        <div className="layout-page layout-gutter-x py-6 md:py-8">
          <h1
            className={cn(
              "text-[28px] leading-tight font-semibold text-foreground md:text-[32px]",
              !rtl && "font-chillax",
              rtl && "font-cairo"
            )}
          >
            {pageTitle}
          </h1>
          <p className={cn("mt-2 max-w-md text-[14px] text-muted-foreground", rtl && "font-cairo")}>
            {rtl ? "اختر الفئة التي تناسبك" : "Find exactly what you're looking for"}
          </p>
        </div>
      </div>

      <div className="layout-page layout-gutter-x py-6 md:py-8">
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

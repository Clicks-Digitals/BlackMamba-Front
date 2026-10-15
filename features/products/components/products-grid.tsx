"use client";
import { useTranslations } from "next-intl";
import { ProductCard, InfiniteScroll } from "@/components/shared";
import { getProducts } from "@/features/products";
import type { PaginatedResponse } from "@/types";
import type { Product } from "@/types/product";

type Props = {
  filters: Record<string, string>;
  locale: string;
  onCountChange?: (count: number) => void;
  initialData?: PaginatedResponse<Product>;
};

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-none border border-border bg-card">
      <div className="aspect-square w-full animate-pulse bg-white" />
      <div className="space-y-3 px-2.5 pt-2.5 pb-2.5">
        <div className="h-4 w-4/5 bg-muted" />
        <div className="h-5 w-20 bg-muted" />
      </div>
    </div>
  );
}

const SKELETON_COUNT = 10;

export function ProductsGrid({ filters, locale, onCountChange, initialData }: Props) {
  const t = useTranslations("Products");

  return (
    <InfiniteScroll
      fetchAction={getProducts}
      filters={filters}
      initialData={initialData}
      onCountChange={onCountChange}
      loadingUI={null}
      emptyState={
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {/* S13: a shopper who searched "ryzn" was told nothing matched
                their *filters*, which they had never touched. Name the search
                term back to them instead — it is almost always a typo. */}
            {filters.search
              ? t("noSearchResults", { query: filters.search })
              : t("noResults")}
          </p>
          {filters.search ? (
            <p className="mt-2 text-[13px] text-muted-foreground/70">
              {t("noSearchResultsHint")}
            </p>
          ) : null}
        </div>
      }
    >
      {(items, isLoading) => (
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              className="w-full"
            />
          ))}
          {isLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={`skel-${i}`} />
            ))}
        </div>
      )}
    </InfiniteScroll>
  );
}

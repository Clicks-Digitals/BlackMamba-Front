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
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#17181b]">
      <div className="aspect-square w-full animate-pulse bg-[#1e1f22]" />
      <div className="space-y-3 border-t border-white/8 p-3.5">
        <div className="h-4 w-4/5 rounded bg-white/8" />
        <div className="flex items-end justify-between pt-1">
          <div className="space-y-1.5">
            <div className="h-2.5 w-10 rounded bg-white/6" />
            <div className="h-4 w-16 rounded bg-white/10" />
          </div>
          <div className="size-10 rounded-[12px] bg-white/8" />
        </div>
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
        <p className="py-16 text-center text-sm text-white/40">{t("noResults")}</p>
      }
    >
      {(items, isLoading) => (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

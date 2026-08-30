"use client";

import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "@/types/product";

interface WishlistGridProps {
  products: Product[];
  locale?: string;
}

export function WishlistGrid({ products, locale }: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} className="w-full shrink" />
      ))}
    </div>
  );
}

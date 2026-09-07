"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
  locale: string;
};

export function SubHeaderCategories({ categories, locale }: Props) {
  const rtl = locale === "ar";

  if (categories.length === 0) return null;

  return (
    <div className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
      <div className="flex h-[var(--layout-subnav-height)] min-w-max items-stretch">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category_slug=${cat.slug}`}
            className={cn(
              "inline-flex h-full items-center border-e border-black/10 px-3 text-[13px] font-medium whitespace-nowrap text-[#000000] transition-colors duration-150 hover:bg-black/5",
              rtl && "font-cairo"
            )}
          >
            {rtl ? cat.name_ar || cat.name : cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

import { CategoryCard } from "@/components/shared";
import type { Category } from "@/types";

interface CategoriesGridProps {
  categories: Category[];
  locale?: string;
  exploreLabel?: string;
}

export function CategoriesGrid({ categories, locale, exploreLabel }: CategoriesGridProps) {
  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          locale={locale}
          exploreLabel={exploreLabel}
          className="w-full aspect-[4/5]"
        />
      ))}
    </div>
  );
}

import Link from "next/link";
import { CategoryCard } from "@/components/shared";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

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
  const visible = categories.slice(0, 8);

  return (
    <section className="layout-section-y">
      <div className="layout-page layout-gutter-x">
        <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
          <div className="min-w-0">
            <p className="bm-kicker mb-2">{rtl ? "اكتشف" : "Discover"}</p>
            <h2
              className={cn(
                "leading-none text-foreground",
                "text-[clamp(1.65rem,3.2vw,2.5rem)]",
                !rtl && "font-chillax tracking-wide",
                rtl && "font-cairo font-semibold"
              )}
            >
              {title}
            </h2>
          </div>
          <Link
            href="/categories"
            className={cn(
              "hidden shrink-0 rounded-md border border-white/12 px-4 py-2 text-sm font-semibold text-white/75 transition-colors duration-200 hover:border-primary/40 hover:text-white sm:inline-flex",
              rtl && "font-cairo"
            )}
          >
            {viewAllLabel}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              locale={locale}
              exploreLabel={exploreLabel}
              className="w-full aspect-[4/5]"
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/categories"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-md border border-white/12 px-6 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-primary/40 hover:text-white",
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

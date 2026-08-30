import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Category } from "@/types/category";
import { CategoryDrawerOpenButton } from "@/components/layout/category-drawer";
import { SubHeaderCategories } from "@/components/layout/header/sub-header-categories";

type SubHeaderProps = {
  categories: Category[];
};

export async function SubHeader({ categories }: SubHeaderProps) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Header")]);
  const items = categories.filter(Boolean);

  return (
    <div
      data-subnav=""
      className="w-full border-b border-white/6 bg-store-nav"
      style={{ minHeight: "var(--layout-subnav-height)" }}
    >
      <div className="layout-page layout-gutter-x flex min-h-(--layout-subnav-height) items-center gap-2.5">
        <CategoryDrawerOpenButton
          label={t("allCategories")}
          className="flex h-7 shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/4 px-2.5 text-white/70 transition-colors duration-200 hover:border-white/20 hover:bg-white/8 hover:text-white"
        >
          <span className="hidden whitespace-nowrap text-[11px] font-semibold tracking-[0.14em] uppercase lg:inline">
            {t("allCategories")}
          </span>
        </CategoryDrawerOpenButton>

        <SubHeaderCategories categories={items} locale={locale} />

        <div className="hidden shrink-0 items-center gap-1.5 ps-1 md:flex">
          <Link
            href="/products?new_release=true"
            className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border border-primary/40 bg-primary/15 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary"
          >
            {t("newRelease")}
          </Link>
          <Link
            href="/products?clearance_sale=true"
            className="inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border border-deal/40 bg-deal/15 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-deal"
          >
            {t("clearanceSale")}
          </Link>
        </div>
      </div>
    </div>
  );
}

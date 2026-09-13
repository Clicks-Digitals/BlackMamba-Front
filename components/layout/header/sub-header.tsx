import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronDown, Menu } from "lucide-react";
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
      className="w-full border-b border-black/10 bg-store-subnav text-store-subnav-fg"
      style={{ minHeight: "var(--layout-subnav-height)" }}
    >
      <div className="layout-page layout-gutter-x flex min-h-(--layout-subnav-height) items-center gap-0">
        <CategoryDrawerOpenButton
          label={t("allCategories")}
          className="flex h-full min-h-(--layout-subnav-height) shrink-0 items-center gap-1.5 border-e border-black/10 px-3 text-[13px] font-semibold text-[#000000] transition-colors duration-150 hover:bg-black/5"
        >
          <Menu className="size-4 shrink-0" strokeWidth={2} />
          <span className="hidden whitespace-nowrap lg:inline">{t("allCategories")}</span>
          <ChevronDown className="hidden size-3.5 shrink-0 opacity-60 lg:inline" strokeWidth={2} />
        </CategoryDrawerOpenButton>

        <SubHeaderCategories categories={items} locale={locale} />

        <div className="ms-auto hidden h-full shrink-0 items-center md:flex">
          <Link
            href="/products?new_release=true"
            className="inline-flex h-full min-h-(--layout-subnav-height) items-center border-s border-black/10 px-3 text-[12px] font-semibold text-[#000000] transition-colors duration-150 hover:bg-black/5"
          >
            {t("newRelease")}
          </Link>
          <Link
            href="/products?clearance_sale=true"
            className="inline-flex h-full min-h-(--layout-subnav-height) items-center border-s border-black/10 px-3 text-[12px] font-semibold text-primary transition-colors duration-150 hover:bg-black/5"
          >
            {t("clearanceSale")}
          </Link>
        </div>
      </div>
    </div>
  );
}

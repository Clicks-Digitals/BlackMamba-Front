"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
  activeSlugs: Set<string>;
  locale: string;
  onToggle: (slug: string) => void;
  className?: string;
};

export function MobileCategoriesSelect({
  categories, activeSlugs, locale, onToggle, className,
}: Props) {
  const t = useTranslations("Products");
  const rtl = locale === "ar";

  const parents = useMemo(
    () => categories.filter((c) => !c.parent && c.is_active !== false),
    [categories]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parent || c.is_active === false) continue;
      const list = map.get(c.parent) ?? [];
      list.push(c);
      map.set(c.parent, list);
    }
    return map;
  }, [categories]);

  if (parents.length === 0) return null;

  const label =
    activeSlugs.size > 0
      ? `${t("categories")} (${activeSlugs.size})`
      : t("categories");

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-between rounded-full border border-white/10 bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <span className="truncate">{label}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[60vh] overflow-y-auto p-1"
        >
          {parents.map((parent, index) => {
            const parentName = rtl ? parent.name_ar || parent.name : parent.name;
            const isParentActive = activeSlugs.has(parent.slug);
            const subs = childrenByParent.get(parent.id) ?? [];
            return (
              <div key={parent.id}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuCheckboxItem
                  checked={isParentActive}
                  onCheckedChange={() => onToggle(parent.slug)}
                  onSelect={(e) => e.preventDefault()}
                  className={cn("font-semibold")}
                >
                  {parentName}
                </DropdownMenuCheckboxItem>
                {subs.map((c) => {
                  const subName = rtl ? c.name_ar || c.name : c.name;
                  const isSubActive = activeSlugs.has(c.slug);
                  return (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={isSubActive}
                      onCheckedChange={() => onToggle(c.slug)}
                      onSelect={(e) => e.preventDefault()}
                      className="ps-6 text-[13px]"
                    >
                      {subName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

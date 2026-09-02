"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  FiltersPanel,
  type FiltersPanelProps,
  SORT_OPTIONS,
  type SortValue,
} from "@/features/products";

type Props = FiltersPanelProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: SortValue;
  onSortChange: (next: SortValue) => void;
};

export function MobileFiltersDrawer({
  open,
  onOpenChange,
  sort,
  onSortChange,
  ...panelProps
}: Props) {
  const t = useTranslations("Products");
  const locale = useLocale();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={locale === "ar" ? "left" : "right"}>
      <DrawerContent className="bg-card md:hidden">
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-border px-4">
          <DrawerTitle className="text-[14px] font-semibold uppercase tracking-wide text-foreground">
            {t("filtersTitle")}
          </DrawerTitle>
          <DrawerClose
            aria-label="Close"
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-4">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-foreground">
              {t("sortBy")}
            </h3>
            <ul className="flex flex-col gap-1">
              {SORT_OPTIONS.map((opt) => {
                const isActive = sort === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => onSortChange(opt.value)}
                      className={cn(
                        "flex min-h-11 w-full items-center rounded-md px-3 py-2.5 text-start text-[13px] transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-foreground/85 hover:bg-primary/10 hover:text-foreground"
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-border pt-4">
            {/* Categories are intentionally suppressed here because the
                mobile category selectbox already covers parent + sub picking. */}
            <FiltersPanel {...panelProps} categories={[]} childCategories={[]} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks";
import { SortDropdown,type SortValue} from "@/features/products";

type Props = {
  count: number;
  search: string;
  onSearchChange: (next: string) => void;
  sort: SortValue;
  onSortChange: (next: SortValue) => void;
  onOpenFilters?: () => void;
};

const DEBOUNCE_MS = 350;

export function ProductsHeader({
  count,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onOpenFilters,
}: Props) {
  const t = useTranslations("Products");
  const [draft, setDraft] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setDraft(search);
  }

  const debouncedDraft = useDebounce(draft, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedDraft === search) return;
    onSearchChange(debouncedDraft);
  }, [debouncedDraft, search, onSearchChange]);

  return (
    <div className="mx-auto flex w-full max-w-200 flex-col gap-3">
      <p className="font-chillax text-[20px] font-semibold text-foreground md:text-[22px]">
        {t("count", { count })}
      </p>

      <div className="flex w-full items-center gap-2 sm:gap-3">
        <label className="relative flex h-9 min-w-0 flex-1 items-center">
          <Search className="absolute start-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 w-full rounded-[4px] border border-border bg-card ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </label>

        <SortDropdown
          value={sort}
          onChange={onSortChange}
          className="hidden shrink-0 md:inline-flex"
        />

        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={t("filter")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-border bg-card text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary hover:text-white md:hidden"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

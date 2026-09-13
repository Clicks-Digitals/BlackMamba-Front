"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, DEFAULT_SORT, type SortValue } from "@/features/products";

type Props = {
  value: SortValue;
  onChange: (next: SortValue) => void;
  className?: string;
  variant?: "dark" | "light";
};

export function SortDropdown({ value, onChange, className, variant = "dark" }: Props) {
  const t = useTranslations("Products");
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const isDefault = value === DEFAULT_SORT;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[4px] px-3 text-[13px] font-medium transition-colors duration-150",
            variant === "dark"
              ? "bg-primary text-white hover:bg-[var(--blue-hover)]"
              : "border border-border bg-card text-foreground hover:bg-muted",
            className
          )}
        >
          <span className="opacity-80">{t("sortBy")}:</span>
          <span>{t(current.labelKey)}</span>
          <ChevronDown className="size-4 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {SORT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onChange(opt.value)}
            className={cn(
              "cursor-pointer",
              opt.value === value && "font-semibold",
              opt.value === DEFAULT_SORT && isDefault && "font-semibold"
            )}
          >
            {t(opt.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

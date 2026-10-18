"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { setCurrency } from "@/actions/setCurrency";
import { useStoreNavDrawer } from "@/stores/store-nav-drawer-store";
import { useUiStore } from "@/stores/ui-store";
import type { Currency } from "@/types/currency";
import { currencyLabel } from "@/lib/utils";

interface CurrencySwitcherProps {
  currencies: Currency[];
  currentCurrency: string;
  variant?: "header" | "drawer" | "storeNav";
}

export function CurrencySwitcher({
  currencies,
  currentCurrency,
  variant = "header"
}: CurrencySwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const t = useTranslations("Header.currency");
  const router = useRouter();
  const setAppLoading = useUiStore((s) => s.setAppLoading);
  const closeDrawer = useStoreNavDrawer((s) => s.setOpen);
  const wasPending = useRef(false);

  useEffect(() => {
    if (isPending) {
      wasPending.current = true;
    } else if (wasPending.current) {
      wasPending.current = false;
      setAppLoading(false);
      closeDrawer(false);
    }
  }, [isPending, setAppLoading, closeDrawer]);

  const list =
    currencies.length > 0
      ? currencies
      : [{ id: 0, code: "JOD", name: "Jordanian Dinar", symbol: "JD" }];
  const active = list.find((c) => c.code === currentCurrency) ?? list[0];
  // S18: the Arabic store showed "JOD" here; use the same label the Arabic
  // prices use, and the Arabic name where we have one.
  const label = (currency: Currency) => currencyLabel(currency, locale);
  const nameOf = (currency: Currency) => {
    const key = `names.${currency.code}`;
    return t.has(key as never) ? t(key as never) : currency.name;
  };

  function handleSelect(code: string) {
    if (code === currentCurrency) return;
    const target = list.find((c) => c.code === code);
    // The loader shows the same label and name as this menu, so the Arabic
    // store doesn't flash "JOD" / "Jordanian Dinar" while switching.
    setAppLoading(true, target ? { type: "currency", code: target.code, name: nameOf(target), symbol: label(target) } : undefined);
    startTransition(async () => {
      await setCurrency(code);
      router.refresh();
    });
  }

  const isDrawer = variant === "drawer";
  const isStoreNav = variant === "storeNav";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          aria-label={t("select")}
          className={[
            "flex h-8 items-center gap-1 px-2 text-[12px] font-medium transition-colors focus-visible:outline-none disabled:opacity-60",
            isDrawer
              ? "border border-white/15 text-white/80 hover:bg-white/10"
              : isStoreNav
                ? "text-white/80 hover:text-white"
                : "border border-white/20 text-white/90 hover:bg-white/10"
          ].join(" ")}
        >
          <span>{label(active)}</span>
          <ChevronDown size={12} className={isPending ? "animate-spin opacity-50" : ""} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {list.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleSelect(currency.code)}
            className="flex cursor-pointer items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="min-w-9 rounded bg-muted px-1.5 py-0.5 text-center text-[11px] font-semibold text-foreground">
                {label(currency)}
              </span>
              <span className="text-sm text-muted-foreground">{nameOf(currency)}</span>
            </div>
            {currency.code === currentCurrency && (
              <Check size={14} className="text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

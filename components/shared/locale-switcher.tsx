"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/actions/setLocale";
import { useStoreNavDrawer } from "@/stores/store-nav-drawer-store";
import { useUiStore } from "@/stores/ui-store";

interface LocaleSwitcherProps {
  currentLocale: string;
  variant?: "header" | "drawer" | "storeNav";
}

export function LocaleSwitcher({ currentLocale, variant = "header" }: LocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
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

  const localeNames: Record<string, string> = { en: "English", ar: "العربية" };

  function switchLocale(next: string) {
    if (next === currentLocale) return;
    setAppLoading(true, { type: "locale", code: next.toUpperCase(), name: localeNames[next] ?? next });
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const isDrawer = variant === "drawer";
  const isStoreNav = variant === "storeNav";

  const shell = isDrawer
    ? "border border-white/15 bg-white/5"
    : isStoreNav
      ? "border border-store-nav-fg/35 bg-store-nav/80"
      : "border border-white/30 bg-white/10 backdrop-blur-sm";

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={["flex h-8 items-center rounded-full p-0.5 text-xs font-medium", shell].join(" ")}
    >
      {(["en", "ar"] as const).map((locale) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            onClick={() => switchLocale(locale)}
            disabled={isPending}
            aria-pressed={isActive}
            className={[
              "h-full rounded-full px-3 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
              isActive
                ? isDrawer
                  ? "bg-primary text-white shadow-sm focus-visible:ring-primary/40"
                  : isStoreNav
                    ? "bg-primary text-white shadow-sm focus-visible:ring-primary/40"
                    : "bg-white text-primary shadow-sm focus-visible:ring-white/60"
                : isDrawer
                  ? "text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
                  : isStoreNav
                    ? "text-store-nav-fg/85 hover:bg-white/10 hover:text-white focus-visible:ring-white/40"
                    : "text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white/60"
            ].join(" ")}
          >
            {locale === "en" ? "EN" : "AR"}
          </button>
        );
      })}
    </div>
  );
}

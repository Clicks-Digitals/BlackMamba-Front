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
    ? "border border-white/15"
    : isStoreNav
      ? ""
      : "border border-white/20";

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={[
        "flex h-8 items-center text-[12px] font-medium",
        isStoreNav ? "px-1.5" : "",
        shell,
      ].join(" ")}
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
              "h-8 px-2 transition-colors duration-150 focus-visible:outline-none disabled:opacity-60",
              isActive
                ? "font-semibold text-primary"
                : "text-white/55 hover:text-white",
            ].join(" ")}
          >
            {locale === "en" ? "EN" : "AR"}
          </button>
        );
      })}
    </div>
  );
}

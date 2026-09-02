"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      role="group"
      aria-label={t("themeToLight")}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-md border border-white/12 bg-white/4 p-0.5 sm:h-10",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label={t("themeToLight")}
        title={t("themeToLight")}
        aria-pressed={!isDark}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors duration-200 sm:size-9",
          !isDark
            ? "bg-white/15 text-white"
            : "text-white/45 hover:text-white"
        )}
      >
        <Sun className="size-3.5 sm:size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label={t("themeToDark")}
        title={t("themeToDark")}
        aria-pressed={isDark}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors duration-200 sm:size-9",
          isDark
            ? "bg-white/15 text-white"
            : "text-white/45 hover:text-white"
        )}
      >
        <Moon className="size-3.5 sm:size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

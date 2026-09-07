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
      className={cn("inline-flex h-8 shrink-0 items-center px-1", className)}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label={t("themeToLight")}
        title={t("themeToLight")}
        aria-pressed={!isDark}
        className={cn(
          "inline-flex size-8 items-center justify-center transition-colors duration-150",
          !isDark ? "text-white" : "text-white/40 hover:text-white"
        )}
      >
        <Sun className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label={t("themeToDark")}
        title={t("themeToDark")}
        aria-pressed={isDark}
        className={cn(
          "inline-flex size-8 items-center justify-center transition-colors duration-150",
          isDark ? "text-white" : "text-white/40 hover:text-white"
        )}
      >
        <Moon className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

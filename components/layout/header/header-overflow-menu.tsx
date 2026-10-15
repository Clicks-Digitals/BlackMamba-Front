"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Heart, MoreVertical, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

/**
 * Below xl the header cannot fit favourites and the theme toggle alongside
 * search, the cart and the logo — the cart was being pushed off the right
 * edge. Search and the cart keep their own icons; the other two collapse in
 * here.
 */
export function HeaderOverflowMenu() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const favActive = pathname === "/favourites" || pathname.startsWith("/wishlist");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("openMenu")}
          className="relative inline-flex size-9 shrink-0 items-center justify-center text-store-nav-fg/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <MoreVertical className="size-5" strokeWidth={1.75} />
          {wishlistCount > 0 && (
            <span
              aria-hidden
              className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-primary"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="min-w-52">
        <DropdownMenuItem asChild className="cursor-pointer gap-2.5">
          <Link href="/favourites">
            <Heart
              className={cn("size-4 shrink-0", favActive && "text-primary")}
              strokeWidth={1.75}
              fill={favActive || wishlistCount > 0 ? "currentColor" : "none"}
            />
            <span className="flex-1">{t("wishlist")}</span>
            {wishlistCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-[1.4] text-white tabular-nums">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => setTheme(isDark ? "light" : "dark")}
          className="cursor-pointer gap-2.5"
        >
          {isDark ? (
            <Sun className="size-4 shrink-0" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4 shrink-0" strokeWidth={1.75} />
          )}
          <span>{isDark ? t("themeToLight") : t("themeToDark")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

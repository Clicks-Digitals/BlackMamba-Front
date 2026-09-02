"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function CountBadge({ count }: { count: number }) {
  const [pop, setPop] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count !== prev.current) {
      setPop(true);
      const t = window.setTimeout(() => setPop(false), 360);
      prev.current = count;
      return () => window.clearTimeout(t);
    }
  }, [count]);

  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground absolute -top-0.5 -end-0.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold leading-none",
        pop && "bm-badge-pop"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderIcons() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const cartCount = useCartStore((s) => s.count);
  const favActive = pathname === "/favourites" || pathname.startsWith("/wishlist");
  const cartActive = pathname === "/cart" || pathname.startsWith("/cart/");

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <Link
        href="/favourites"
        aria-label={t("wishlist")}
        aria-current={favActive ? "page" : undefined}
        className={cn(
          "relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 hover:bg-store-nav-fg/8 hover:text-store-nav-fg",
          favActive ? "bg-store-nav-fg/8 text-store-nav-fg" : "text-store-nav-fg/80"
        )}
      >
        <Heart
          className="pointer-events-none size-5"
          strokeWidth={1.75}
          fill={favActive || wishlistCount > 0 ? "currentColor" : "none"}
        />
        <CountBadge count={wishlistCount} />
      </Link>
      <Link
        href="/cart"
        aria-label={t("cart")}
        aria-current={cartActive ? "page" : undefined}
        className={cn(
          "relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 hover:bg-store-nav-fg/8 hover:text-store-nav-fg",
          cartActive ? "bg-store-nav-fg/8 text-store-nav-fg" : "text-store-nav-fg/80"
        )}
      >
        <ShoppingCart className="pointer-events-none size-5" strokeWidth={1.75} />
        <CountBadge count={cartCount} />
      </Link>
    </div>
  );
}

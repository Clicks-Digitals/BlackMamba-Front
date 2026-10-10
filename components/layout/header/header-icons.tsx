"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function CountBadge({ count, className }: { count: number; className?: string }) {
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
        pop && "bm-badge-pop",
        className
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
    <div className="flex items-center gap-1">
      {/* Secondary: favourites. Icon only — the cart is the one that has to survive
          a 360px viewport, so this one gives up its label first. */}
      <Link
        href="/favourites"
        aria-label={t("wishlist")}
        aria-current={favActive ? "page" : undefined}
        className={cn(
          "relative inline-flex size-9 shrink-0 items-center justify-center text-store-nav-fg/80 transition-colors duration-150 hover:bg-white/10 hover:text-white",
          favActive && "bg-white/10 text-white"
        )}
      >
        <Heart
          className="pointer-events-none size-[20px]"
          strokeWidth={1.75}
          fill={favActive || wishlistCount > 0 ? "currentColor" : "none"}
        />
        <CountBadge count={wishlistCount} />
      </Link>

      {/* Primary: the cart. Always a solid, labelled target. */}
      <Link
        href="/cart"
        aria-label={t("cart")}
        aria-current={cartActive ? "page" : undefined}
        className={cn(
          "relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[4px] bg-primary px-2.5 text-white transition-colors duration-150 hover:bg-[#c40a16] sm:px-3",
          cartActive && "ring-1 ring-white/40"
        )}
      >
        <ShoppingCart className="pointer-events-none size-[19px]" strokeWidth={2} />
        <span className="hidden text-[13px] font-semibold leading-none min-[420px]:inline">
          {t("cart")}
        </span>
        <CountBadge count={cartCount} className="bg-white text-primary ring-1 ring-primary/20" />
      </Link>
    </div>
  );
}

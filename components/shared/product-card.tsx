"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { WishlistButton } from "./wishlist-button";
import { ClearanceSaleCountdown } from "./clearance-countdown";
import { addToCartAction, updateCartItemAction } from "@/features/cart/actions/mutations";
import { useCartStore, buildCartItemKey } from "@/stores/cart-store";

function discountPercent(p: Product): number | null {
  if (!p.has_discount || !p.base_price || !p.discount_price) return null;
  const b = Number.parseFloat(p.base_price);
  const d = Number.parseFloat(p.discount_price);
  if (!Number.isFinite(b) || b <= 0 || !Number.isFinite(d) || d >= b) return null;
  return Math.round(((b - d) / b) * 100);
}

function badgeLabel(
  product: Product,
  hasCampaign: boolean,
  pct: number | null,
  t: ReturnType<typeof useTranslations<"Home">>
): string | null {
  if (hasCampaign) return pct != null ? `-${pct}%` : t("sale");
  if (product.has_discount) return t("sale");
  if (product.clearance_sale) return t("sale");
  if (product.best_seller) return t("featured");
  return null;
}

export type ProductCardProps = {
  product: Product;
  locale?: string;
  className?: string;
};

export function ProductCard({ product, locale, className }: ProductCardProps) {
  const t = useTranslations("Home");
  const rtl = locale === "ar";
  const name = rtl ? product.name_ar || product.name : product.name;
  const img =
    product.thumbnail ||
    product.gallery?.find((g) => g.is_primary)?.file ||
    product.gallery?.[0]?.file;
  const sym = product.currency_info?.symbol ?? "";

  const hasCampaign = !!product.campaign_price;
  const hasDiscount = product.has_discount && !!product.discount_price;

  const finalPrice = hasCampaign
    ? product.campaign_price!
    : hasDiscount
    ? product.discount_price!
    : product.base_price;
  const origPrice = hasCampaign || hasDiscount ? product.base_price : null;
  const pct = hasCampaign
    ? (() => {
        const b = Number.parseFloat(product.base_price ?? "0");
        const c = Number.parseFloat(product.campaign_price!);
        if (!Number.isFinite(b) || b <= 0 || !Number.isFinite(c) || c >= b) return null;
        return Math.round(((b - c) / b) * 100);
      })()
    : discountPercent(product);

  const badge = badgeLabel(product, hasCampaign, pct, t);

  const { setCount, getItemRef, upsertItemRef } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const itemKey = buildCartItemKey({ product: product.id, variation: null, combination: null });
  const isInCart = !!getItemRef(itemKey);

  const needsVariations = product.inventory_mode === "TRACK_VARIATIONS";
  const outOfStock = product.inventory_mode === "TRACK" && (product.product_stock ?? 0) <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    if (needsVariations) return;
    e.preventDefault();
    e.stopPropagation();

    const existing = getItemRef(itemKey);
    if (existing) {
      const newQty = existing.quantity + 1;
      startTransition(async () => {
        const res = await updateCartItemAction(existing.itemId, newQty);
        if (res.status === "success") {
          upsertItemRef(itemKey, { itemId: existing.itemId, quantity: newQty });
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      });
      return;
    }

    startTransition(async () => {
      const res = await addToCartAction({ product: product.id, quantity: 1 });
      if (res.status === "success") {
        if (res.data?.count !== undefined) setCount(res.data.count);
        if (res.data?.itemId) {
          upsertItemRef(itemKey, { itemId: res.data.itemId, quantity: res.data.itemQuantity ?? 1 });
        }
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  const cartLabel = outOfStock
    ? t("outOfStock") || "Out of Stock"
    : isInCart
    ? t("inCart") || "In Cart"
    : t("addToCart");

  const cartButtonClass = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    outOfStock
      ? "cursor-not-allowed bg-muted text-muted-foreground/50"
      : isInCart
      ? "bg-primary text-white hover:bg-[#d12f27]"
      : "bg-primary text-white hover:bg-[#d12f27] active:scale-95",
    isPending && "cursor-not-allowed opacity-70"
  );

  const cartIcon = isPending ? (
    <Loader2 size={16} className="animate-spin" />
  ) : isInCart && !outOfStock ? (
    <Check size={16} strokeWidth={2.5} />
  ) : (
    <ShoppingCart size={16} strokeWidth={2} />
  );

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-card",
        "border border-border transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-card-hover)]",
        "motion-reduce:transform-none motion-reduce:hover:translate-y-0",
        outOfStock && "opacity-85",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          data-card-media
          className="relative aspect-square w-full overflow-hidden border-b border-border bg-muted/40"
        >
          {img ? (
            <Image
              src={img}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-muted/40" />
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-background/40" />
          )}

          {badge && (
            <span className="absolute top-2.5 start-2.5 z-20 inline-flex h-[22px] items-center rounded-md bg-primary/15 px-2 text-[10px] font-bold uppercase tracking-wide text-primary">
              {badge}
            </span>
          )}

          <div className="absolute top-2 end-2 z-20">
            <WishlistButton
              productId={product.id}
              className="size-8 rounded-full border-transparent bg-background/70 p-0 text-foreground/70 shadow-none hover:border-transparent hover:bg-background hover:text-foreground"
            />
          </div>

          {product.clearance_sale && product.clearance_sale_end && (
            <div className="absolute inset-x-0 bottom-0 z-20">
              <ClearanceSaleCountdown endIso={product.clearance_sale_end} />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <Link href={`/products/${product.slug}`}>
          <p
            className={cn(
              "line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-foreground sm:text-[14px]",
              rtl && "font-cairo"
            )}
          >
            {name}
          </p>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            <p className={cn("text-[11px] font-normal text-muted-foreground", rtl && "font-cairo")}>
              {t("price")}
            </p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
              {finalPrice && (
                <span className={cn("text-[16px] font-bold leading-none text-foreground sm:text-[17px]", hasCampaign && "text-deal")}>
                  {sym}{finalPrice}
                </span>
              )}
              {origPrice && (
                <span className="text-[11px] leading-none text-muted-foreground line-through">
                  {sym}{origPrice}
                </span>
              )}
            </div>
          </div>

          {needsVariations ? (
            <Link
              href={`/products/${product.slug}`}
              aria-label={t("addToCart")}
              className={cartButtonClass}
            >
              <ShoppingCart size={16} strokeWidth={2} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isPending || outOfStock}
              aria-label={cartLabel}
              className={cartButtonClass}
            >
              {cartIcon}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

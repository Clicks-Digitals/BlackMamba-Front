"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingCart, Check, Loader2, Star } from "lucide-react";
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
  const brand = product.brand
    ? rtl
      ? product.brand.name_ar || product.brand.name
      : product.brand.name
    : null;

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

  const rating = product.avg_rating;
  const reviews = product.review_count ?? 0;

  const { setCount, getItemRef, upsertItemRef } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const itemKey = buildCartItemKey({ product: product.id, variation: null, combination: null });
  const isInCart = !!getItemRef(itemKey);

  const needsVariations = product.inventory_mode === "TRACK_VARIATIONS";
  const outOfStock =
    product.in_stock === false ||
    (product.inventory_mode === "TRACK" && (product.product_stock ?? 0) <= 0);

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
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    outOfStock
      ? "cursor-not-allowed bg-muted text-muted-foreground/50"
      : isInCart
        ? "bg-primary text-white hover:bg-[var(--blue-hover)]"
        : "border border-border bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-white",
    isPending && "cursor-not-allowed opacity-70"
  );

  const cartIcon = isPending ? (
    <Loader2 size={14} className="animate-spin" strokeWidth={2} />
  ) : isInCart && !outOfStock ? (
    <Check size={14} strokeWidth={2.25} />
  ) : (
    <ShoppingCart size={14} strokeWidth={1.75} />
  );

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col rounded-none bg-card",
        "border border-border transition-colors duration-150 hover:border-primary",
        outOfStock && "opacity-80",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          data-card-media
          className="relative aspect-square w-full overflow-hidden rounded-none bg-white"
        >
          {img ? (
            <Image
              src={img}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-contain p-4"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-[#FFFFFF]" />
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background uppercase">
                {t("outOfStock")}
              </span>
            </div>
          )}

          <div className="absolute top-0 end-0 z-20">
            <WishlistButton
              productId={product.id}
              className="size-7 rounded-none border-border bg-white/90 p-0 text-muted-foreground shadow-none hover:border-primary hover:bg-white hover:text-primary"
            />
          </div>

          {product.clearance_sale && product.clearance_sale_end && (
            <div className="absolute inset-x-0 bottom-0 z-20">
              <ClearanceSaleCountdown endIso={product.clearance_sale_end} />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-2.5 pt-2.5 pb-2.5">
        {pct != null ? (
          <span className="mb-1.5 inline-flex w-fit bg-[#b8e0b8] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[#1a5c2a]">
            {pct}% OFF
          </span>
        ) : null}

        {brand ? (
          <p className={cn("mb-0.5 truncate text-[11px] text-muted-foreground", rtl && "font-cairo")}>
            {brand}
          </p>
        ) : null}

        <Link href={`/products/${product.slug}`}>
          <p
            className={cn(
              "line-clamp-3 min-h-[3.9em] text-[13px] leading-[1.3] font-semibold text-foreground hover:text-primary",
              rtl && "font-cairo"
            )}
          >
            {name}
          </p>
        </Link>

        {product.sku ? (
          <p className="mt-1 truncate text-[11px] tabular-nums text-muted-foreground">
            {rtl ? "رمز المنتج" : "SKU"}: {product.sku}
          </p>
        ) : null}

        {rating != null && rating > 0 ? (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star size={12} strokeWidth={0} className="fill-amber-400 text-amber-400" />
            <span className="tabular-nums text-foreground">{rating.toFixed(1)}</span>
            {reviews > 0 ? <span>({reviews})</span> : null}
          </p>
        ) : null}

        <div className="mt-auto pt-3">
          {finalPrice && (
            <p
              className={cn(
                "text-[18px] leading-none font-bold tabular-nums text-foreground",
                hasCampaign && "text-deal",
                rtl && "font-cairo"
              )}
            >
              {sym}
              {finalPrice}
            </p>
          )}
          {origPrice && (
            <p className="mt-1 text-[12px] leading-none text-muted-foreground line-through tabular-nums">
              {sym}
              {origPrice}
            </p>
          )}

          {outOfStock ? (
            <p className="mt-2 text-[12px] font-medium text-destructive">{t("outOfStock")}</p>
          ) : product.in_stock ? (
            <p className="mt-2 text-[12px] font-medium text-emerald-500">
              {rtl ? "متوفر" : "In stock"}
            </p>
          ) : null}

          <div className="mt-3 flex justify-end">
            {needsVariations ? (
              <Link href={`/products/${product.slug}`} aria-label={t("addToCart")} className={cartButtonClass}>
                <ShoppingCart size={14} strokeWidth={1.75} />
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
      </div>
    </article>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Minus, Plus, ShoppingCart, Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product, VariationGroup, VariationOption, Combination } from "@/types";
import { addToCartAction, updateCartItemAction } from "@/features/cart/actions/mutations";
import { useCartStore, buildCartItemKey } from "@/stores/cart-store";
import { useProductImageStore } from "@/stores/product-image-store";
import { WishlistButton } from "@/components/shared";

type SelectionResult =
  | { type: "variation"; option: VariationOption }
  | { type: "combination"; combination: Combination };

interface VariationSelectorProps {
  group: VariationGroup;
  groupLabel: string;
  locale: string;
  selected: Record<string, string>;
  onSelect: (groupName: string, variationId: string) => void;
  combinations: Combination[];
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function isOptionAvailable(
  variationId: string,
  groupName: string,
  selected: Record<string, string>,
  combinations: Combination[],
): boolean {
  const otherSelectedIds = Object.entries(selected)
    .filter(([k]) => k !== groupName)
    .map(([, v]) => v);
  return combinations.some(
    (c) =>
      c.is_available &&
      c.stock_quantity > 0 &&
      c.variation_ids.includes(variationId) &&
      otherSelectedIds.every((id) => c.variation_ids.includes(id)),
  );
}

function VariationSelector({ group, groupLabel, locale, selected, onSelect, combinations }: VariationSelectorProps) {
  const isAr = locale === "ar";
  return (
    <div>
      <h3 className="mb-2 font-chillax text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
        {groupLabel}
      </h3>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => {
          const isSelected = selected[group.name] === option.variation_id;
          const available = isOptionAvailable(option.variation_id, group.name, selected, combinations);
          const hexColor = option.color_code || (HEX_RE.test(option.value) ? option.value : null);
          const optionLabel = isAr && option.value_ar ? option.value_ar : option.value;

          if (hexColor) {
            return (
              <button
                key={option.variation_id}
                type="button"
                onClick={() => onSelect(group.name, option.variation_id)}
                disabled={!available}
                title={optionLabel}
                className={cn(
                  "size-8 rounded-md border transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-card scale-105"
                    : "border-border",
                  !available ? "cursor-not-allowed opacity-40" : "hover:scale-105"
                )}
                style={{ backgroundColor: hexColor }}
              />
            );
          }

          return (
            <button
              key={option.variation_id}
              type="button"
              onClick={() => onSelect(group.name, option.variation_id)}
              disabled={!available}
              className={cn(
                "h-9 rounded-md px-3.5 font-chillax text-sm font-medium transition-all duration-200",
                isSelected
                  ? "bg-primary text-white"
                  : "border border-border bg-muted/40 text-foreground hover:border-primary/50",
                !available ? "cursor-not-allowed line-through opacity-40" : ""
              )}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const locale = useLocale();
  const t = useTranslations("SingleProduct");
  const rtl = locale === "ar";
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<SelectionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const { setCount, getItemRef, upsertItemRef } = useCartStore();
  const { setActiveVariationImage } = useProductImageStore();

  const sym = product.currency_info?.symbol ?? "";
  const apiBase = parseFloat(product.base_price ?? "0");
  const effectiveBase = product.has_discount && product.discount_price
    ? parseFloat(product.discount_price)
    : apiBase;

  function getCurrentKey(): string | null {
    if (product.inventory_mode === "TRACK_VARIATIONS") {
      if (selection?.type === "combination") return `combo-${selection.combination.id}`;
      if (selection?.type === "variation") return `var-${selection.option.variation_id}`;
      return null;
    }
    return buildCartItemKey({ product: product.id, variation: null, combination: null });
  }

  function cueAdded() {
    setJustAdded(true);
    window.dispatchEvent(new Event("bm-pdp-cart-cue"));
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  function handleAddToCart() {
    const key = getCurrentKey();
    if (!key) {
      toast.error(t("selectOptionsFirst"));
      return;
    }

    const existing = getItemRef(key);

    if (existing) {
      const newQty = existing.quantity + quantity;
      startTransition(async () => {
        const res = await updateCartItemAction(existing.itemId, newQty);
        if (res.status === "success") {
          upsertItemRef(key, { itemId: existing.itemId, quantity: newQty });
          toast.success(res.message);
          cueAdded();
        } else {
          toast.error(res.message);
        }
      });
      return;
    }

    let payload: { product: string; variation?: string; combination?: string; quantity: number };
    if (product.inventory_mode === "TRACK_VARIATIONS") {
      if (selection?.type === "combination") {
        payload = { product: product.id, combination: selection.combination.id, quantity };
      } else if (selection?.type === "variation") {
        payload = { product: product.id, variation: selection.option.variation_id, quantity };
      } else {
        toast.error(t("pleaseSelectOptions"));
        return;
      }
    } else {
      payload = { product: product.id, quantity };
    }

    startTransition(async () => {
      const res = await addToCartAction(payload);
      if (res.status === "success") {
        if (res.data?.count !== undefined) setCount(res.data.count);
        if (res.data?.itemId) {
          upsertItemRef(key, { itemId: res.data.itemId, quantity: res.data.itemQuantity ?? quantity });
        }
        toast.success(res.message);
        cueAdded();
      } else {
        toast.error(res.message);
      }
    });
  }

  const handleSelect = (groupName: string, variationId: string) => {
    setQuantity(1);
    const isAlreadySelected = selected[groupName] === variationId;
    const newSelected = isAlreadySelected
      ? Object.fromEntries(Object.entries(selected).filter(([k]) => k !== groupName))
      : { ...selected, [groupName]: variationId };

    setSelected(newSelected);

    const entries = Object.entries(newSelected);
    if (entries.length === 0) {
      setSelection(null);
      setActiveVariationImage(null);
      return;
    }

    const selectedIds = entries.map(([, id]) => id);

    // Try to match a combination first — this works for any number of selected groups,
    // including single-variation combinations where only one group needs to be chosen.
    // Sort descending by length so the most-specific combination wins.
    const sorted = [...(product.available_combinations ?? [])].sort((a, b) => b.variation_ids.length - a.variation_ids.length);
    const match = sorted.find((c) => c.variation_ids.every((id) => selectedIds.includes(id))) ?? null;
    if (match) {
      setSelection({ type: "combination", combination: match });
      setActiveVariationImage(match.image ?? null);
      return;
    }

    // No combination resolved yet — keep the variation reference so the gallery
    // image can still update, but the cart button stays disabled until a full match.
    if (entries.length === 1) {
      const [[, singleId]] = entries;
      const option = (product.available_variations ?? []).flatMap((g) => g.options).find((o) => o.variation_id === singleId) ?? null;
      setSelection(option ? { type: "variation", option } : null);
      setActiveVariationImage(option?.image ?? null);
      return;
    }

    setSelection(null);
    setActiveVariationImage(null);
  };

  const inStock =
    product.inventory_mode === "TOGGLE"
      ? (product.in_stock ?? true)
      : product.inventory_mode === "TRACK"
        ? (product.product_stock ?? 0) > 0
        : selection?.type === "combination"
          ? selection.combination.is_available && selection.combination.stock_quantity > 0
          : false;

  const maxStock =
    product.inventory_mode === "TRACK"
      ? product.product_stock ?? 0
      : selection?.type === "combination"
        ? selection.combination.stock_quantity
        : 0;

  // API returns base_price + extra; extract extra and apply to effectiveBase (discount-aware)
  const displayPrice: string = (() => {
    if (selection?.type === "combination" && selection.combination.combination_price) {
      const extra = parseFloat(selection.combination.combination_price) - apiBase;
      return (effectiveBase + extra).toFixed(2);
    }
    if (selection?.type === "variation" && selection.option.variation_price) {
      const extra = parseFloat(selection.option.variation_price) - apiBase;
      return (effectiveBase + extra).toFixed(2);
    }
    return product.has_discount && product.discount_price
      ? product.discount_price
      : product.base_price ?? "0";
  })();

  // Strikethrough shows the un-discounted price; when a combination is selected, include its extra too
  const strikethroughPrice: string | null = product.has_discount && product.base_price
    ? (() => {
        if (selection?.type === "combination" && selection.combination.combination_price) {
          const extra = parseFloat(selection.combination.combination_price) - apiBase;
          return (apiBase + extra).toFixed(2);
        }
        if (selection?.type === "variation" && selection.option.variation_price) {
          const extra = parseFloat(selection.option.variation_price) - apiBase;
          return (apiBase + extra).toFixed(2);
        }
        return product.base_price;
      })()
    : null;

  // A combination was resolved — user has made enough selections regardless of how many groups exist.
  const allGroupsSelected = selection?.type === "combination";

  const canAdd =
    product.inventory_mode === "TOGGLE"
      ? inStock
      : product.inventory_mode === "TRACK"
        ? inStock
        : selection !== null && inStock;

  const discountPct =
    product.has_discount && product.base_price && product.discount_price
      ? Math.round(
          ((Number.parseFloat(product.base_price) - Number.parseFloat(product.discount_price)) /
            Number.parseFloat(product.base_price)) *
            100
        )
      : null;

  const stockLevel =
    product.inventory_mode === "TRACK" ? (product.product_stock ?? 0) : null;
  const isLowStock = stockLevel !== null && stockLevel > 0 && stockLevel <= 5;

  const sku =
    selection?.type === "combination"
      ? selection.combination.sku
      : selection?.type === "variation"
        ? selection.option.sku
        : product.sku;

  const ctaLabel = isPending
    ? t("adding")
    : justAdded
      ? t("addedToCart")
      : !canAdd
        ? product.inventory_mode === "TRACK_VARIATIONS" && !allGroupsSelected
          ? t("selectOptionsPrompt")
          : t("outOfStock")
        : t("addToCart");

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {discountPct !== null && (
            <span className="inline-flex h-6 items-center rounded bg-deal px-2 font-chillax text-[11px] font-bold text-white">
              {t("percentOff", { pct: discountPct })}
            </span>
          )}
          {inStock && product.inventory_mode !== "TRACK_VARIATIONS" && (
            <span
              className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded border px-2 font-chillax text-[11px] font-semibold",
                isLowStock
                  ? "border-deal/30 bg-deal/10 text-deal"
                  : "border-success/30 bg-success/10 text-success"
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", isLowStock ? "bg-deal" : "bg-success")}
                aria-hidden
              />
              {isLowStock ? t("lowStock") : t("inStock")}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span
            className={cn(
              "leading-none text-foreground",
              rtl ? "font-cairo text-[1.65rem] font-bold" : "font-letterman text-[1.75rem]"
            )}
          >
            {sym} {displayPrice}
          </span>
          {strikethroughPrice && (
            <span className="relative font-chillax text-lg leading-none text-muted-foreground">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-primary/60"
              />
              {sym} {strikethroughPrice}
            </span>
          )}
        </div>
        <p className={cn("mt-1.5 text-[12px] text-muted-foreground", rtl && "font-cairo")}>
          {t("vatInclusive")}
        </p>
        {discountPct !== null && strikethroughPrice && displayPrice && (
          <p className={cn("mt-1 text-[12px] font-medium text-deal", rtl && "font-cairo")}>
            {t("youSave", {
              amount: `${sym} ${(Number.parseFloat(strikethroughPrice) - Number.parseFloat(displayPrice)).toFixed(2)}`,
            })}
          </p>
        )}
      </div>

      {product.inventory_mode === "TRACK_VARIATIONS" && (product.available_variations?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="font-chillax text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {t("configure")}
          </p>
          {(product.available_variations ?? []).map((group) => (
            <VariationSelector
              key={group.name}
              group={group}
              groupLabel={locale === "ar" && group.name_ar ? group.name_ar : group.name}
              locale={locale}
              selected={selected}
              onSelect={handleSelect}
              combinations={product.available_combinations ?? []}
            />
          ))}
        </div>
      )}

      {product.inventory_mode !== "TOGGLE" && !inStock && (
        <p className="font-chillax text-sm font-medium text-destructive">
          {product.inventory_mode === "TRACK_VARIATIONS" && !allGroupsSelected
            ? t("selectOptions")
            : t("outOfStock")}
        </p>
      )}

      {sku && (
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {t("sku")}: {sku}
        </p>
      )}

      <div className="flex items-stretch gap-2">
        <div className="inline-flex h-12 shrink-0 items-center overflow-hidden rounded-md border border-border bg-muted/50">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!inStock || quantity <= 1}
            className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            aria-label={t("quantity")}
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="min-w-9 border-x border-border text-center font-chillax text-base font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxStock || 999, q + 1))}
            disabled={!inStock}
            className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            aria-label={t("quantity")}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        <WishlistButton
          productId={product.id}
          className="h-12 w-12 shrink-0 rounded-md border-border bg-muted/50 p-0 hover:bg-primary hover:text-primary-foreground"
        />
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd || isPending}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2.5 rounded-md font-chillax text-[13px] font-bold tracking-[0.12em] uppercase transition-all",
          canAdd
            ? "bg-primary text-white hover:bg-primary/80 active:scale-[0.99]"
            : "cursor-not-allowed bg-muted text-muted-foreground",
          isPending && "opacity-70",
          justAdded && "bm-badge-pop"
        )}
      >
        {justAdded ? <Check size={18} strokeWidth={2.2} /> : !isPending && <ShoppingCart size={18} strokeWidth={1.8} />}
        {ctaLabel}
      </button>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-start gap-2.5">
          <BadgeCheck size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className={cn("text-[12px] font-semibold text-foreground", rtl && "font-cairo")}>
              {t("warrantyTitle")}
            </p>
            <p className={cn("text-[11px] leading-relaxed text-muted-foreground", rtl && "font-cairo")}>
              {t("warrantyBody")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Truck size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
          <p className={cn("text-[12px] text-muted-foreground", rtl && "font-cairo")}>{t("freeDelivery")}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <RotateCcw size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
          <p className={cn("text-[12px] text-muted-foreground", rtl && "font-cairo")}>{t("easyReturns")}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
          <p className={cn("text-[12px] text-muted-foreground", rtl && "font-cairo")}>{t("securePayment")}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Minus, Plus, ShoppingCart, Truck, RotateCcw, ShieldCheck } from "lucide-react";
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "var(--warning)" : "none"}
      stroke={filled ? "var(--warning)" : "var(--border)"}
      strokeWidth="1.5"
      className="size-3.5 shrink-0"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

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
      <h3 className="mb-2 font-chillax text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase">
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
                  "size-7 rounded-md border transition-all",
                  isSelected ? "border-[#d12f27] ring-1 ring-[#d12f27]/50 scale-105" : "border-white/15",
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
                  : "border border-white/12 bg-transparent text-foreground hover:border-primary/50",
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

function DescriptionBlock({
  text,
  rtl,
  heading,
}: {
  text: string;
  rtl: boolean;
  heading: string;
}) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed = lines.map((line) => {
    const split = line.split(/\s*[:：]\s*/);
    if (split.length < 2) return null;
    const k = split[0].trim();
    const v = split.slice(1).join(": ").trim();
    if (!k || !v) return null;
    return { k, v };
  });
  const keyed = parsed.filter((p): p is { k: string; v: string } => p != null);
  const useSheet = keyed.length >= 3 && keyed.length >= Math.ceil(lines.length * 0.6);

  if (!useSheet) {
    return (
      <p className={cn("text-sm leading-relaxed text-white/60", rtl ? "font-cairo" : "font-chillax")}>
        {text}
      </p>
    );
  }

  return (
    <div>
      <p className="bm-kicker mb-3">{heading}</p>
      <dl className="overflow-hidden rounded-md border border-white/10">
        {keyed.map((row, i) => (
          <div
            key={`${row.k}-${i}`}
            className={cn(
              "grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-3 px-3.5 py-2.5",
              i > 0 && "border-t border-white/8",
              i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"
            )}
          >
            <dt
              className={cn(
                "text-[11px] tracking-wider text-white/40 uppercase",
                rtl ? "font-cairo" : "font-chillax"
              )}
            >
              {row.k}
            </dt>
            <dd className={cn("text-[13px] leading-snug text-white/80", rtl ? "font-cairo" : "font-chillax")}>
              {row.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface ProductActionsProps {
  product: Product;
  description?: string | null;
}

export function ProductActions({ product, description }: ProductActionsProps) {
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
    const sorted = [...product.available_combinations].sort((a, b) => b.variation_ids.length - a.variation_ids.length);
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
      const option = product.available_variations.flatMap((g) => g.options).find((o) => o.variation_id === singleId) ?? null;
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

  const avgRating = product.avg_rating ?? null;
  const reviewCount = product.review_count ?? 0;
  const roundedStars = avgRating != null ? Math.min(5, Math.max(0, Math.round(avgRating))) : 0;

  const stockLevel =
    product.inventory_mode === "TRACK" ? (product.product_stock ?? 0) : null;
  const isLowStock = stockLevel !== null && stockLevel > 0 && stockLevel <= 5;

  const sku =
    selection?.type === "combination"
      ? selection.combination.sku
      : selection?.type === "variation"
        ? selection.option.sku
        : null;

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {discountPct !== null && (
              <span className="inline-flex h-6 items-center rounded-md bg-primary px-2 font-chillax text-[11px] font-bold text-white">
                {t("percentOff", { pct: discountPct })}
              </span>
            )}
            {inStock && product.inventory_mode !== "TRACK_VARIATIONS" && (
              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 font-chillax text-[11px] font-semibold",
                  isLowStock
                    ? "border-deal/30 bg-deal/10 text-deal"
                    : "border-white/10 bg-white/4 text-white/80"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isLowStock ? "bg-deal" : "bg-[#d12f27] shadow-[0_0_6px_#d12f27]"
                  )}
                  aria-hidden
                />
                {isLowStock ? t("lowStock") : t("inStock")}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
            <span className={cn("leading-none text-foreground", rtl ? "font-cairo text-[2.6rem] font-bold" : "font-beckman text-[2.75rem]")}>
              {sym} {displayPrice}
            </span>
            {strikethroughPrice && (
              <span className="relative font-chillax text-xl leading-none text-white/30">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-primary/50"
                />
                {sym} {strikethroughPrice}
              </span>
            )}
          </div>
        </div>

        {avgRating !== null && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={i <= roundedStars} />
              ))}
            </div>
            <span className="font-chillax text-sm font-medium text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <span className="font-chillax text-sm text-white/40">
              ({reviewCount} {t("reviews")})
            </span>
          </div>
        )}
      </div>

      {description && (
        <DescriptionBlock text={description} rtl={rtl} heading={t("specifications")} />
      )}

      {product.inventory_mode === "TRACK_VARIATIONS" && product.available_variations.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-white/8 pt-5">
          <p className="bm-kicker">{t("configure")}</p>
          {product.available_variations.map((group) => (
            <VariationSelector
              key={group.name}
              group={group}
              groupLabel={locale === "ar" && group.name_ar ? group.name_ar : group.name}
              locale={locale}
              selected={selected}
              onSelect={handleSelect}
              combinations={product.available_combinations}
            />
          ))}
        </div>
      )}

      {product.inventory_mode !== "TOGGLE" && !inStock && (
        <p className="font-chillax text-sm font-medium text-[#ff6b70]">
          {product.inventory_mode === "TRACK_VARIATIONS" && !allGroupsSelected
            ? t("selectOptions")
            : t("outOfStock")}
        </p>
      )}

      {sku && (
        <p className="font-mono text-[11px] tracking-wide text-white/30">
          {t("sku")} {sku}
        </p>
      )}

      <div className="flex items-stretch gap-2 border-t border-white/8 pt-5">
        <div className="inline-flex h-12 shrink-0 items-center overflow-hidden rounded-md border border-white/12 bg-black/30">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!inStock || quantity <= 1}
            className="flex size-12 items-center justify-center text-foreground transition-colors hover:bg-white/6 disabled:opacity-30"
            aria-label={t("quantity")}
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="min-w-10 border-x border-white/10 text-center font-chillax text-base font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxStock || 999, q + 1))}
            disabled={!inStock}
            className="flex size-12 items-center justify-center text-foreground transition-colors hover:bg-white/6 disabled:opacity-30"
            aria-label={t("quantity")}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd || isPending}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2.5 rounded-md font-chillax text-[13px] font-bold tracking-[0.12em] uppercase transition-all",
            canAdd
              ? "bg-primary text-white hover:bg-[#d12f27] hover:shadow-[0_8px_28px_-10px_rgba(209,47,39,0.8)] active:scale-[0.99]"
              : "cursor-not-allowed bg-white/8 text-white/40",
            isPending && "opacity-70",
            justAdded && "bm-badge-pop"
          )}
        >
          {justAdded ? <Check size={18} strokeWidth={2.2} /> : !isPending && <ShoppingCart size={18} strokeWidth={1.8} />}
          {ctaLabel}
        </button>

        <WishlistButton
          productId={product.id}
          className="h-12 w-12 shrink-0 rounded-md border-white/12 bg-black/30 p-0 hover:bg-primary hover:text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {([
          { icon: Truck, label: t("freeDelivery") },
          { icon: RotateCcw, label: t("easyReturns") },
          { icon: ShieldCheck, label: t("securePayment") },
        ] as const).map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2 py-3 text-center"
          >
            <Icon size={16} strokeWidth={1.5} className="text-[#d12f27]" />
            <span className="font-chillax text-[11px] font-medium leading-tight text-white/60">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

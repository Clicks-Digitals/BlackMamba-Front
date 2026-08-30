"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useOptimistic, useTransition, useState } from "react";
import { Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import { SLOT_LABELS } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "@/features/pc-builder/components/slot-icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCartStore, buildCartItemKey } from "@/stores/cart-store";
import { removeCartItemAction, updateCartItemAction } from "@/features/cart/actions/mutations";
import type { CartItem } from "@/features/cart/types";
import { ProductCard } from "@/components/shared/product-card";
import { CartVariationBadges } from "@/features/cart/components/cart-variation-badges";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface YourCartProps {
  items: CartItem[];
  totalAmount: string;
  relatedProducts?: Product[];
}

type OptimisticAction =
  | { type: "remove"; id: string }
  | { type: "quantity"; id: string; quantity: number };

function itemDisplayName(item: CartItem, locale: string) {
  if (item.build_details) {
    const b = item.build_details;
    if (locale === "ar" && b.name_ar) return b.name_ar;
    return b.name || (locale === "ar" ? "تجميعة كمبيوتر مخصصة" : "Custom PC Build");
  }
  const p = item.product_details;
  if (!p) return "";
  if (locale === "ar" && p.name_ar) return p.name_ar;
  return p.name;
}

function itemSubtitle(item: CartItem, locale: string) {
  if (item.build_details) {
    const n = item.build_details.items.length;
    return locale === "ar" ? `${n} قطعة` : `${n} parts`;
  }
  const c = item.product_details?.categories?.[0];
  if (!c) return "";
  if (locale === "ar" && c.name_ar) return c.name_ar;
  return c.name;
}

function itemThumbnail(item: CartItem): string | null {
  if (item.build_details) return item.build_details.thumbnail;
  return item.product_details?.thumbnail ?? null;
}

export function YourCart({ items, totalAmount, relatedProducts = [] }: YourCartProps) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const ar = locale === "ar";
  const { setCount, removeItemRef, upsertItemRef } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [expandedBuilds, setExpandedBuilds] = useState<Set<string>>(new Set());

  const [optimisticItems, applyOptimistic] = useOptimistic(
    items,
    (current: CartItem[], action: OptimisticAction) => {
      if (action.type === "remove") return current.filter((i) => i.id !== action.id);
      return current.map((i) =>
        i.id === action.id
          ? { ...i, quantity: action.quantity, total_price: (parseFloat(i.price_at_time) * action.quantity).toFixed(2) }
          : i
      );
    }
  );

  const optimisticTotal = optimisticItems.reduce((s, i) => s + parseFloat(i.total_price || "0"), 0).toFixed(2);
  const displayedTotal = isPending ? optimisticTotal : totalAmount;
  const currencySymbol = optimisticItems[0]?.product_details?.currency_info?.symbol ?? "JD";

  const subtotal = parseFloat(displayedTotal);
  const shippingFee = 3;
  const grandTotal = Math.max(0, subtotal + shippingFee);

  function handleRemove(item: CartItem) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id: item.id });
      const res = await removeCartItemAction(item.id);
      if (res.status === "success") {
        setCount(res.data?.count ?? 0);
        removeItemRef(buildCartItemKey(item));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleQuantity(item: CartItem, delta: -1 | 1) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    startTransition(async () => {
      applyOptimistic({ type: "quantity", id: item.id, quantity: newQty });
      const res = await updateCartItemAction(item.id, newQty);
      if (res.status === "success") {
        setCount(res.data?.count ?? 0);
        upsertItemRef(buildCartItemKey(item), { itemId: item.id, quantity: newQty });
        if (res.message) toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bm-page-hero">
        <div className="layout-page layout-gutter-x py-8 sm:py-10">
          <p className="bm-kicker mb-2">{ar ? "طلبك" : "Your bag"}</p>
          <h1
            className={cn(
              "text-[clamp(1.8rem,3.6vw,2.75rem)] leading-none text-white",
              ar ? "font-cairo font-semibold" : "font-beckman uppercase tracking-wide"
            )}
          >
            {t("title")}
          </h1>
        </div>
      </div>

      <div className="layout-page layout-gutter-x pb-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex-1">
            <div className="rounded-lg border border-[#9e1d20]/15 bg-white/3 px-3 py-5 sm:px-6">
              <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-2 border-b border-white/8 pb-3 sm:gap-4">
                <span className="text-sm font-medium text-[#EDEFF0] sm:text-xl">{t("tableOrder")}</span>
                <span className="w-14 text-center text-xs font-medium text-white/50 sm:w-20 sm:text-sm">
                  {t("tablePrice")}
                </span>
                <span className="w-16 text-center text-xs font-medium text-white/50 sm:w-24 sm:text-sm">
                  {t("tableQty")}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {optimisticItems.map((item) => {
                  const name = itemDisplayName(item, locale);
                  const categoryLine = itemSubtitle(item, locale);
                  const thumbnail = itemThumbnail(item);
                  const hasVariation = !!(item.variation_details || item.combination_details);
                  const isBuild = !!item.build_details;
                  const buildParts = item.build_details?.items ?? [];
                  const isExpanded = expandedBuilds.has(item.id);

                  return (
                    <React.Fragment key={item.id}>
                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[#26292C] bg-[#0B0F0E] sm:size-22.5">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={name}
                                fill
                                sizes="(max-width:640px) 64px, 90px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-white/5">
                                <span className="font-chillax text-lg text-foreground/30">PC</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            {categoryLine && !isBuild ? (
                              <p className="text-[11px] text-white/45">{categoryLine}</p>
                            ) : null}
                            <p className="text-[15px] font-bold text-[#EDEFF0]">{name}</p>
                            {isBuild && buildParts.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedBuilds((prev) => {
                                    const next = new Set(prev);
                                    next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                                    return next;
                                  })
                                }
                                className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors"
                              >
                                {buildParts.length} {ar ? "قطعة" : "parts"}
                                <ChevronDown
                                  size={12}
                                  className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
                                />
                              </button>
                            )}
                            {hasVariation && (
                              <CartVariationBadges item={item} locale={locale} className="mt-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="w-20 text-center" dir="ltr">
                          <span className="text-base font-medium text-[#EDEFF0] tabular-nums">
                            {currencySymbol}
                            {item.price_at_time}
                          </span>
                        </div>

                        <div className="flex w-24 items-center justify-between gap-1">
                          <div
                            className="flex items-center rounded-lg border border-[#9e1d20]/40 bg-white/4 px-1"
                            dir="ltr"
                          >
                            <button
                              type="button"
                              onClick={() => handleQuantity(item, -1)}
                              disabled={item.quantity <= 1 || isPending}
                              className="flex size-5 items-center justify-center text-[19px] text-[#EDEFF0] disabled:opacity-40"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-5 text-center text-[19px] text-[#EDEFF0]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantity(item, 1)}
                              disabled={isPending}
                              className="flex size-5 items-center justify-center text-[19px] text-[#EDEFF0] disabled:opacity-40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={isPending}
                            className="text-white/40 transition-colors hover:text-[#d12f27]"
                            aria-label={t("removeAria")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* ── PC Build parts breakdown ── */}
                      {isBuild && isExpanded && buildParts.length > 0 && (
                        <div className="ms-18 sm:ms-25.5 overflow-hidden rounded-lg border border-primary/10 bg-[#121314]">
                          {buildParts.map((part, idx) => {
                            const SlotIcon = SLOT_ICONS[part.slot];
                            return (
                            <div
                              key={part.id}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2",
                                idx < buildParts.length - 1 && "border-b border-primary/8"
                              )}
                            >
                              <span className="w-22 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
                                {SLOT_LABELS[part.slot]}
                              </span>
                              <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-[#0B0F0E] border border-[#26292C] flex items-center justify-center">
                                {part.product_details.thumbnail ? (
                                  <Image
                                    src={part.product_details.thumbnail}
                                    alt=""
                                    fill
                                    sizes="28px"
                                    className="object-contain p-0.5"
                                    unoptimized
                                  />
                                ) : (
                                  <SlotIcon className="size-3.5 text-foreground/30" />
                                )}
                              </div>
                              <span className="flex-1 truncate text-[12px] text-ink">
                                {(ar && part.product_details.name_ar) || part.product_details.name}
                              </span>
                              <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink" dir="ltr">
                                {currencySymbol}{part.unit_price}
                              </span>
                            </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="h-px bg-white/8" />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-89.5 lg:shrink-0">
            <h2
              className={cn(
                "mb-3 text-3xl text-[#EDEFF0]",
                ar ? "font-cairo font-semibold" : "font-chillax"
              )}
            >
              {t("paymentSummary")}
            </h2>
            <div className="rounded-lg border border-[#9e1d20]/15 bg-white/3 px-6 py-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#EDEFF0]">{t("summaryOrder")}</span>
                  <span className="text-[15px] font-medium text-[#EDEFF0] tabular-nums" dir="ltr">
                    {currencySymbol}
                    {displayedTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#EDEFF0]">{t("shippingFees")}</span>
                  <span className="text-[15px] font-medium text-[#EDEFF0] tabular-nums" dir="ltr">
                    {currencySymbol}
                    {shippingFee}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#EDEFF0]">{t("paymentMethod")}</span>
                  <span className="text-[15px] font-medium text-[#EDEFF0]">{t("cashOnDelivery")}</span>
                </div>
                <div className="my-1 h-px bg-white/8" />
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-[#EDEFF0]">{t("totalAmount")}</span>
                  <span className="text-[15px] font-bold text-[#9e1d20] tabular-nums" dir="ltr">
                    {currencySymbol}
                    {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-5 flex h-11.75 w-full items-center justify-center rounded-lg bg-primary text-[15px] font-medium text-white transition-colors hover:bg-[#d12f27]"
              >
                {t("orderNow")}
              </Link>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
              <h2
                className={cn(
                  "text-5xl text-foreground sm:text-6xl",
                  ar ? "font-cairo font-semibold tracking-normal" : "font-chillax tracking-wide"
                )}
              >
                {t("youMayAlsoLike")}
              </h2>
              <Link href="/products" className="text-xl font-medium text-foreground hover:underline sm:text-2xl">
                {t("viewMore")}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

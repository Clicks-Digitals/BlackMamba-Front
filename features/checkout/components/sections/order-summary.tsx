"use client";

import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/forms/Input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Cart } from "@/features/cart/types";
import type { CouponData } from "@/features/cart/actions/mutations";
import { CartVariationBadges } from "@/features/cart/components/cart-variation-badges";
import { SLOT_LABELS } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "@/features/pc-builder/components/slot-icons";
import type { ShippingOption } from "@/features/checkout/types";

interface OrderSummaryProps {
  cart: Cart | null;
  totalAmount: string;
  discountAmount: number;
  finalTotal: string;
  appliedCoupon: CouponData | null;
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  selectedShipping: ShippingOption | undefined;
  currencySuffix: string;
}

function SubmitOrderButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Checkout.orderSummary");

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full cursor-pointer rounded-lg bg-primary py-6 font-bold tracking-wider text-white uppercase hover:bg-[#d12f27] disabled:opacity-50"
    >
      {pending ? t("processing") : t("completePurchase")}
    </Button>
  );
}

export function OrderSummary({
  cart,
  totalAmount,
  discountAmount,
  finalTotal,
  appliedCoupon,
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  selectedShipping,
  currencySuffix
}: OrderSummaryProps) {
  const t = useTranslations("Checkout.orderSummary");
  const locale = useLocale();
  const [expandedBuilds, setExpandedBuilds] = useState<Set<string>>(new Set());

  if (!cart) return null;

  return (
    <div className="sticky top-4 space-y-4 rounded-lg border border-[#9e1d20]/15 bg-white/3 p-4 md:p-6">
      <div className="border-b border-white/8 pb-3 text-center">
        <h2 className="text-base font-bold tracking-wider text-[#EDEFF0] uppercase">{t("title")}</h2>
      </div>

      <ScrollArea className="scrollbar-thin max-h-52 pe-2">
        <div className="space-y-3">
          {cart.items.map((item) => {
            const isBuild = !!item.build_details;
            const name = isBuild
              ? item.build_details!.name || (locale === "ar" ? "تجميعة كمبيوتر مخصصة" : "Custom PC Build")
              : (locale === "ar" && item.product_details?.name_ar) || item.product_details?.name;
            const thumbnail = isBuild ? item.build_details!.thumbnail : item.product_details?.thumbnail;
            const buildParts = item.build_details?.items ?? [];
            const isExpanded = expandedBuilds.has(item.id);

            return (
              <div key={item.id} className="border-b border-white/8 pb-3 last:border-0">
                <div className="flex gap-3">
                  <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-lg border border-[#26292C] bg-[#0B0F0E]">
                    {thumbnail ? (
                      <Image src={thumbnail} fill sizes="56px" className="object-cover" alt={name ?? ""} unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/35">
                        PC
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-[#EDEFF0] uppercase leading-snug">{name}</h4>
                    <p className="text-xs text-white/45">{t("qty", { count: item.quantity })}</p>
                    {isBuild && buildParts.length > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBuilds((prev) => {
                            const next = new Set(prev);
                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                            return next;
                          })
                        }
                        className="flex items-center gap-0.5 text-[11px] font-medium text-white/45 hover:text-[#EDEFF0] transition-colors"
                      >
                        {locale === "ar" ? `${buildParts.length} قطعة` : `${buildParts.length} parts`}
                        <ChevronDown
                          size={11}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    ) : (
                      (item.variation_details || item.combination_details) && (
                        <CartVariationBadges item={item} locale={locale} />
                      )
                    )}
                    <p className="text-sm font-bold text-[#9e1d20] pt-0.5">
                      {item.total_price} {currencySuffix}
                    </p>
                  </div>
                </div>

                {/* PC Build parts list */}
                {isBuild && isExpanded && buildParts.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-[#26292C] bg-[#17181B]">
                    {buildParts.map((part, idx) => {
                      const SlotIcon = SLOT_ICONS[part.slot];
                      return (
                      <div
                        key={part.id}
                        className={`flex items-center gap-2.5 px-2.5 py-2${idx < buildParts.length - 1 ? " border-b border-white/8" : ""}`}
                      >
                        {/* Thumbnail */}
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-[#0B0F0E] border border-[#26292C] flex items-center justify-center">
                          {part.product_details.thumbnail ? (
                            <Image
                              src={part.product_details.thumbnail}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          ) : (
                            <SlotIcon className="size-4 text-white/30" />
                          )}
                        </div>

                        {/* Name + slot label */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium leading-tight text-[#EDEFF0]">
                            {(locale === "ar" && part.product_details.name_ar) || part.product_details.name}
                          </p>
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-white/40 mt-0.5">
                            {SLOT_LABELS[part.slot]}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#9e1d20]" dir="ltr">
                          {part.unit_price} {currencySuffix}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t border-b border-white/8 py-3">
        {appliedCoupon ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
                {appliedCoupon.code}
              </span>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-emerald-400 transition-colors hover:text-emerald-300"
                aria-label={t("removeCouponAria")}
              >
                <X size={16} />
              </button>
            </div>
            {!appliedCoupon.appliesToAll && (() => {
              const scopeNames = [
                ...(appliedCoupon.scope?.categories ?? []),
                ...(appliedCoupon.scope?.brands ?? []),
                ...(appliedCoupon.scope?.products ?? []),
              ].map((item) => item.name);
              if (scopeNames.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="text-[10px] text-emerald-400 font-medium shrink-0">{t("couponAppliesTo")}:</span>
                  {scopeNames.map((name) => (
                    <span
                      key={name}
                      className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                type="text"
                value={couponInput}
                onChange={(e) => onCouponInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onApplyCoupon())}
                placeholder={t("couponPlaceholder")}
                className="h-11 w-full rounded-md py-0 text-xs leading-normal placeholder:text-xs"
              />
            </div>
            <Button
              disabled={!couponInput.trim()}
              onClick={onApplyCoupon}
              type="button"
              className="h-11 max-h-11 min-h-11 shrink-0 cursor-pointer rounded-md border-0 bg-primary px-4 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#d12f27] disabled:opacity-50 sm:px-6"
            >
              {t("apply")}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">{t("subtotal")}</span>
          <span className="font-semibold text-[#EDEFF0]">
            {totalAmount} {currencySuffix}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{t("discount", { code: appliedCoupon?.code ?? "" })}</span>
            <span className="font-semibold">
              -{discountAmount.toFixed(2)} {currencySuffix}
            </span>
          </div>
        )}

        {selectedShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              {(locale === "ar" && selectedShipping.name_ar) || selectedShipping.name}
            </span>
            <span className="font-semibold text-[#EDEFF0]">
              {selectedShipping.price} {currencySuffix}
            </span>
          </div>
        )}

        <Separator className="my-2" />

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-[#EDEFF0] uppercase">{t("total")}</span>
          <span className="text-2xl font-light text-[#9e1d20]">
            {finalTotal} {currencySuffix}
          </span>
        </div>
      </div>

      <SubmitOrderButton />
    </div>
  );
}

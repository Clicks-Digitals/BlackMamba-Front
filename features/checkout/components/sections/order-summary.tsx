"use client";

import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/forms/Input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConsentNotice } from "@/features/auth/components/consent-notice";
import type { Cart } from "@/features/cart/types";
import type { CouponData } from "@/features/cart/actions/mutations";
import { CartVariationBadges } from "@/features/cart/components/cart-variation-badges";
import { SLOT_LABELS } from "@/features/pc-builder/types";
import { SLOT_ICONS } from "@/features/pc-builder/components/slot-icons";
import type { ShippingOption } from "@/features/checkout/types";
import { buildDiscount, partsLabel } from "@/features/pc-builder/lib/cart-line";
import { formatPrice } from "@/lib/utils";

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
}

function SubmitOrderButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Checkout.orderSummary");
  const rtl = useLocale() === "ar";

  return (
    <div className="space-y-3">
      <Button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-lg bg-primary py-6 font-bold tracking-wider text-white uppercase hover:bg-[#EB0B1A] disabled:opacity-50"
      >
        {pending ? t("processing") : t("completePurchase")}
      </Button>
      {/* S2: checkout pointed at no terms or privacy policy. */}
      <ConsentNotice action="order" rtl={rtl} />
    </div>
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
  selectedShipping
}: OrderSummaryProps) {
  const t = useTranslations("Checkout.orderSummary");
  const locale = useLocale();
  const [expandedBuilds, setExpandedBuilds] = useState<Set<string>>(new Set());

  if (!cart) return null;

  // The same "JOD 1,278.10" as the cart. Checkout printed the raw amounts -
  // "1278.1 JOD" - so the two pages disagreed about the same figures.
  const currency = cart.items.find((i) => i.product_details)?.product_details?.currency_info ?? null;
  const price = (amount: string | number) => formatPrice(amount, currency, locale);

  return (
    <div className="sticky top-4 space-y-4 rounded-lg border border-[#EB0B1A]/15 bg-muted p-4 md:p-6">
      <div className="border-b border-border pb-3 text-center">
        <h2 className="text-base font-bold tracking-wider text-foreground uppercase">{t("title")}</h2>
      </div>

      {/* A plain scroll box. The ScrollArea here had only a max height, which
          its 100%-high viewport cannot resolve, so a long cart never scrolled:
          it ran under the coupon field, the totals and Complete Purchase. */}
      <div className="scrollbar-thin max-h-72 overflow-y-auto overscroll-contain pe-2">
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
              <div key={item.id} className="border-b border-border pb-3 last:border-0">
                <div className="flex gap-3">
                  <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                    {thumbnail ? (
                      <Image src={thumbnail} fill sizes="56px" className="object-cover" alt={name ?? ""} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                        PC
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground uppercase leading-snug">{name}</h4>
                    <p className="text-xs text-muted-foreground">{t("qty", { count: item.quantity })}</p>
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
                        className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {partsLabel(buildParts.length, locale)}
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
                    <p className="text-sm font-bold text-[#EB0B1A] pt-0.5" dir={locale === "ar" ? "auto" : "ltr"}>
                      {price(item.total_price)}
                    </p>
                  </div>
                </div>

                {/* PC Build parts list */}
                {isBuild && isExpanded && buildParts.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
                    {buildParts.map((part, idx) => {
                      const SlotIcon = SLOT_ICONS[part.slot];
                      return (
                      <div
                        key={part.id}
                        className={`flex items-center gap-2.5 px-2.5 py-2${idx < buildParts.length - 1 ? " border-b border-border" : ""}`}
                      >
                        {/* Thumbnail */}
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border bg-white flex items-center justify-center">
                          {part.product_details.thumbnail ? (
                            <Image
                              src={part.product_details.thumbnail}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <SlotIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Name + slot label */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium leading-tight text-foreground">
                            {(locale === "ar" && part.product_details.name_ar) || part.product_details.name}
                          </p>
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mt-0.5">
                            {SLOT_LABELS[part.slot]}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#EB0B1A]" dir={locale === "ar" ? "auto" : "ltr"}>
                          {price(part.unit_price)}
                        </span>
                      </div>
                      );
                    })}
                    {(() => {
                      const discount = buildDiscount(item.build_details);
                      if (!discount) return null;
                      return (
                        <div className="flex items-center justify-between gap-2 border-t border-border px-2.5 py-2 text-[11px] font-semibold text-primary">
                          <span>
                            {locale === "ar"
                              ? `خصم الحزمة (${discount.percent}%)`
                              : `Bundle discount (${discount.percent}%)`}
                          </span>
                          <span className="tabular-nums" dir={locale === "ar" ? "auto" : "ltr"}>
                            -{price(discount.amount)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border-t border-b border-border py-3">
        {appliedCoupon ? (
          <div className="rounded-lg border border-primary/25 bg-primary/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                {appliedCoupon.code}
              </span>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-primary transition-colors hover:text-primary"
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
                  <span className="text-[10px] text-primary font-medium shrink-0">{t("couponAppliesTo")}:</span>
                  {scopeNames.map((name) => (
                    <span
                      key={name}
                      className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold"
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
              className="h-11 max-h-11 min-h-11 shrink-0 cursor-pointer rounded-md border-0 bg-primary px-4 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#EB0B1A] disabled:opacity-50 sm:px-6"
            >
              {t("apply")}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="font-semibold text-foreground tabular-nums" dir={locale === "ar" ? "auto" : "ltr"}>
            {price(totalAmount)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-primary">
            <span>{t("discount", { code: appliedCoupon?.code ?? "" })}</span>
            <span className="font-semibold tabular-nums" dir={locale === "ar" ? "auto" : "ltr"}>
              -{price(discountAmount)}
            </span>
          </div>
        )}

        {selectedShipping && (
          <div className="flex justify-between text-sm">
            {/* The option's own name is an internal label — the only one
                configured is literally called "default". */}
            <span className="text-muted-foreground">{t("shippingLine")}</span>
            <span className="font-semibold text-foreground tabular-nums" dir={locale === "ar" ? "auto" : "ltr"}>
              {price(selectedShipping.price)}
            </span>
          </div>
        )}

        <Separator className="my-2" />

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-foreground uppercase">{t("total")}</span>
          <span className="text-2xl font-light text-[#EB0B1A] tabular-nums" dir={locale === "ar" ? "auto" : "ltr"}>
            {price(finalTotal)}
          </span>
        </div>
      </div>

      <SubmitOrderButton />
    </div>
  );
}

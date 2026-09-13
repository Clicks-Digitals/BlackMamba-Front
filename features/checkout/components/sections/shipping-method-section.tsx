"use client";

import { Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ShippingOption } from "@/features/checkout/types";

interface ShippingMethodSectionProps {
  shippingOptions: ShippingOption[];
  selectedShippingId: string;
  onShippingChange: (id: string) => void;
  stepNumber: number;
  currencySuffix: string;
}

export function ShippingMethodSection({
  shippingOptions,
  selectedShippingId,
  onShippingChange,
  stepNumber,
  currencySuffix
}: ShippingMethodSectionProps) {
  const t = useTranslations("Checkout");
  const locale = useLocale();

  const labelFor = (option: ShippingOption) =>
    locale === "ar" && option.name_ar ? option.name_ar : option.name;

  const descFor = (option: ShippingOption) =>
    locale === "ar" && option.description_ar ? option.description_ar : option.description;

  const etaLabel = (option: ShippingOption) => {
    if (option.estimated_days_min === option.estimated_days_max) {
      const c = option.estimated_days_min;
      return c === 1 ? t("shipping.oneDay") : t("shipping.multipleDays", { count: c });
    }
    return t("shipping.range", { min: option.estimated_days_min, max: option.estimated_days_max });
  };

  return (
    <section className="space-y-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {stepNumber}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFFFF]">
          {t("section.shippingMethod")}
        </h3>
        <Separator className="flex-1 bg-white/10" />
      </div>

      {shippingOptions.length > 0 ? (
        <RadioGroup value={selectedShippingId} onValueChange={onShippingChange}>
          <ScrollArea className="scrollbar-thin max-h-56 rounded-lg border border-border bg-card pe-4">
            <div className="space-y-2 p-3">
              {shippingOptions.map((option, idx) => (
                <div key={option.id}>
                  <label
                    htmlFor={`shipping-${option.id}`}
                    className="flex cursor-pointer items-start gap-4 rounded-lg p-4 transition-colors hover:bg-white/5"
                  >
                    <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#FFFFFF]">{labelFor(option)}</p>
                          <p className="text-xs text-white/50">{descFor(option)}</p>
                        </div>
                        <span className="text-sm font-bold text-[#EB0B1A]">
                          {option.price} {currencySuffix}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Calendar size={14} className="text-[var(--secondary-text)]" />
                        <span className="text-xs font-semibold text-[#FFFFFF]">{etaLabel(option)}</span>
                      </div>
                    </div>
                  </label>
                  {idx < shippingOptions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </RadioGroup>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-white/15 p-5 text-center">
          <p className="text-sm text-white/50">{t("shipping.noOptions")}</p>
        </div>
      )}
    </section>
  );
}

"use client";

import { Banknote, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

interface PaymentMethodSectionProps {
  stepNumber: number;
}

export function PaymentMethodSection({ stepNumber }: PaymentMethodSectionProps) {
  const t = useTranslations("Checkout");

  return (
    <section className="space-y-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {stepNumber}
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFFFF]">
          {t("section.paymentMethod")}
        </h3>
        <Separator className="flex-1 bg-white/10" />
      </div>

      <div className="rounded-lg border border-[#EB0B1A]/40 bg-[#EB0B1A]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <Banknote size={22} className="text-[#EB0B1A]" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wider text-[#FFFFFF] uppercase">
              {t("payment.codTitle")}
            </p>
            <p className="mt-0.5 text-xs text-white/50">{t("payment.codSubtitle")}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 p-2.5">
          <Shield size={14} className="text-primary" />
          <span className="text-xs text-primary">{t("payment.secure")}</span>
        </div>
      </div>
    </section>
  );
}

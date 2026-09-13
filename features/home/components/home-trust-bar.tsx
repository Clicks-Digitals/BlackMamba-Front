import { Truck, ShieldCheck, MessageCircle, Award } from "lucide-react";
import { getLocale } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TRUST_ITEMS: {
  Icon: LucideIcon;
  enTitle: string;
  arTitle: string;
  enSub: string;
  arSub: string;
}[] = [
  {
    Icon: Truck,
    enTitle: "Cash on Delivery",
    arTitle: "الدفع عند الاستلام",
    enSub: "Pay when your order arrives",
    arSub: "ادفع عند وصول طلبك",
  },
  {
    Icon: ShieldCheck,
    enTitle: "100% Genuine",
    arTitle: "منتجات أصلية 100%",
    enSub: "Verified authentic products",
    arSub: "منتجات أصلية موثقة",
  },
  {
    Icon: Award,
    enTitle: "1-Year Warranty",
    arTitle: "ضمان سنة كاملة",
    enSub: "On all products",
    arSub: "على جميع المنتجات",
  },
  {
    Icon: MessageCircle,
    enTitle: "WhatsApp Support",
    arTitle: "دعم واتساب",
    enSub: "Quick order assistance",
    arSub: "مساعدة سريعة في الطلبات",
  },
];

export async function HomeTrustBar() {
  const locale = await getLocale();
  const rtl = locale === "ar";

  return (
    <section className="py-4 sm:py-5">
      <div className="layout-page layout-gutter-x">
        <div className="grid grid-cols-2 overflow-hidden rounded-[6px] border border-border bg-card lg:grid-cols-4">
          {TRUST_ITEMS.map(({ Icon, enTitle, arTitle, enSub, arSub }, i) => (
            <div
              key={enTitle}
              className={cn(
                "flex items-center gap-3 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5",
                i !== TRUST_ITEMS.length - 1 && "lg:border-e lg:border-border",
                i % 2 === 0 && "max-lg:border-e max-lg:border-border",
                i < 2 && "max-lg:border-b max-lg:border-border"
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[12px] font-semibold leading-snug text-foreground sm:text-[14px]",
                    rtl && "font-cairo"
                  )}
                >
                  {rtl ? arTitle : enTitle}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-[12px]",
                    rtl && "font-cairo"
                  )}
                >
                  {rtl ? arSub : enSub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

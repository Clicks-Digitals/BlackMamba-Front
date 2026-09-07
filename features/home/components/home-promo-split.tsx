"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { FeaturedCoupon } from "../actions/queries";

const WHATSAPP_NUMBER = "962XXXXXXXXX"; // replace with real number

function CopyButton({ code, rtl }: { code: string; rtl: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-150",
        "hover:bg-[var(--blue-hover)]",
        rtl && "font-cairo"
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <Copy className="h-4 w-4 shrink-0" />
      )}
      {copied
        ? rtl ? "تم النسخ!" : "Copied!"
        : rtl ? "انسخ الكود" : "Copy Code"}
    </button>
  );
}

export function HomePromoSplit({ coupon }: { coupon: FeaturedCoupon }) {
  const locale = useLocale();
  const rtl = locale === "ar";

  const discountLabel =
    coupon.discount_type === "PERCENTAGE"
      ? rtl
        ? `احصل على خصم ${coupon.discount_value}% على طلبك`
        : `Get ${coupon.discount_value}% off your order`
      : rtl
      ? `وفّر ${coupon.discount_value} على طلبك`
      : `Save ${coupon.discount_value} on your order`;

  const waMessage = rtl
    ? "مرحبا، أريد الاستفسار عن منتج"
    : "Hello, I'd like to inquire about a product";
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className="layout-section-y">
      <div className="layout-page layout-gutter-x">
        <div className="grid overflow-hidden rounded-[8px] border border-border md:grid-cols-5">
          <div className="relative flex flex-col items-center justify-center gap-4 bg-card px-6 py-10 text-center sm:px-10 md:col-span-3 md:px-12 md:py-12">
            <p
              className={cn(
                "relative text-[13px] font-semibold text-muted-foreground",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "كود الخصم الحصري" : "Exclusive Discount Code"}
            </p>

            <div className="relative rounded-[4px] border border-dashed border-border bg-background px-5 py-3 sm:px-8 sm:py-4">
              <span
                className="font-beckman leading-none tracking-wide text-foreground uppercase"
                style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)" }}
              >
                {coupon.code}
              </span>
            </div>

            <p
              className={cn(
                "relative max-w-[24ch] text-[15px] font-medium text-muted-foreground",
                rtl && "font-cairo"
              )}
            >
              {discountLabel}
            </p>

            <div className="relative">
              <CopyButton code={coupon.code} rtl={rtl} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-t border-border bg-card px-6 py-10 text-center sm:px-10 md:col-span-2 md:border-t-0 md:border-s md:px-10 md:py-12">
            <MessageCircle className="h-6 w-6 text-[#EB0B1A]" strokeWidth={1.8} />

            <div>
              <p
                className={cn(
                  "text-[18px] font-semibold leading-tight text-foreground md:text-[20px]",
                  !rtl && "font-chillax tracking-wide",
                  rtl && "font-cairo font-bold"
                )}
              >
                {rtl ? "اطلب عبر واتساب" : "Order via WhatsApp"}
              </p>
              <p
                className={cn(
                  "mt-2 text-[13px] text-muted-foreground sm:text-[14px]",
                  rtl && "font-cairo"
                )}
              >
                {rtl
                  ? "تواصل معنا مباشرة للمساعدة في طلبك"
                  : "Chat with us directly for order support"}
              </p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary/80",
                rtl && "font-cairo"
              )}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              {rtl ? "تواصل الآن" : "Chat Now"}
            </a>

            <p className={cn("text-[11px] text-muted-foreground", rtl && "font-cairo")}>
              {rtl ? "متاح طوال أيام الأسبوع" : "Available 7 days a week"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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
        "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200",
        "hover:bg-[#d12f27] active:scale-[0.98]",
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
        <div className="grid overflow-hidden rounded-xl border border-white/8 md:grid-cols-5">
          <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden bg-[#161718] px-6 py-12 text-center sm:px-10 md:col-span-3 md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute -top-24 -end-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />
            <p
              className={cn(
                "relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#d12f27]",
                rtl && "font-cairo tracking-normal"
              )}
            >
              {rtl ? "كود الخصم الحصري" : "Exclusive Discount Code"}
            </p>

            <div className="relative rounded-lg border border-dashed border-primary/35 bg-black/25 px-6 py-4 sm:px-10 sm:py-5">
              <span
                className="font-beckman leading-none tracking-[0.08em] text-white uppercase"
                style={{ fontSize: "clamp(2rem,7vw,3.75rem)" }}
              >
                {coupon.code}
              </span>
            </div>

            <p
              className={cn(
                "relative max-w-[24ch] text-[15px] font-medium text-white/65",
                rtl && "font-cairo"
              )}
            >
              {discountLabel}
            </p>

            <div className="relative">
              <CopyButton code={coupon.code} rtl={rtl} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 border-t border-white/8 bg-[#101112] px-6 py-12 text-center sm:px-10 md:col-span-2 md:border-t-0 md:border-s md:border-white/8 md:px-12 md:py-16">
            <div className="flex size-14 items-center justify-center rounded-lg bg-[#25d366]/12">
              <MessageCircle className="h-6 w-6 text-[#25d366]" strokeWidth={1.8} />
            </div>

            <div>
              <p
                className={cn(
                  "leading-tight text-white",
                  "text-[clamp(1.35rem,3vw,1.85rem)]",
                  !rtl && "font-chillax tracking-wide",
                  rtl && "font-cairo font-bold"
                )}
              >
                {rtl ? "اطلب عبر واتساب" : "Order via WhatsApp"}
              </p>
              <p
                className={cn(
                  "mt-2 text-[13px] text-white/45 sm:text-[14px]",
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
                "inline-flex items-center gap-2.5 rounded-md bg-[#25d366] px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#1db954]",
                rtl && "font-cairo"
              )}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              {rtl ? "تواصل الآن" : "Chat Now"}
            </a>

            <p className={cn("text-[11px] text-white/30", rtl && "font-cairo")}>
              {rtl ? "متاح طوال أيام الأسبوع" : "Available 7 days a week"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

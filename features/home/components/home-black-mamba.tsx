import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function HomeBlackMamba() {
  const locale = await getLocale();
  const rtl = locale === "ar";

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-background py-12 sm:py-16 md:py-20">
      <div className="layout-page layout-gutter-x relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn(rtl && "lg:order-2")}>
          <p className="mb-3 text-[13px] font-medium text-muted-foreground">
            Black Mamba
          </p>

          <h2
            className={cn(
              "max-w-[12ch] leading-[0.92] text-foreground",
              "text-[clamp(1.75rem,4vw,2.75rem)]",
              !rtl && "font-beckman uppercase tracking-wide",
              rtl && "font-cairo font-bold"
            )}
          >
            {rtl ? "ابنِ جهازك الأسطوري" : "Build Your Dream PC"}
          </h2>

          <p
            className={cn(
              "mt-5 max-w-md text-muted-foreground",
              "text-[clamp(0.95rem,1.5vw,1.15rem)] leading-relaxed",
              rtl && "font-cairo"
            )}
          >
            {rtl
              ? "اختر القطع المتوافقة وابنِ جهازك بنفسك — أفضل الأسعار على قطع الكمبيوتر في الأردن"
              : "Pick compatible parts and build it yourself — best prices on PC components in Jordan"}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(rtl
              ? ["توافق مضمون", "GPU · CPU · RAM", "ضمان المنتج", "أسعار JOD"]
              : ["Compatibility Check", "GPU · CPU · RAM · SSD", "Product Warranty", "JOD Pricing"]
            ).map((chip) => (
              <span
                key={chip}
                className={cn(
                  "rounded-[4px] border border-border px-2.5 py-1",
                  "text-[11px] font-medium text-muted-foreground",
                  rtl && "font-cairo"
                )}
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/pc-builder"
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-[4px] bg-primary px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--blue-hover)]",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "ابدأ البناء" : "Start Building"}
            </Link>
            <Link
              href="/pc-builder/parts"
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-[4px] border border-border px-5 text-sm font-medium text-foreground/80 transition-colors duration-150 hover:border-primary/50 hover:text-foreground",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "تصفح القطع" : "Browse Parts"}
            </Link>
          </div>
        </div>

        <div className={cn("relative", rtl && "lg:order-1")}>
          <div className="relative aspect-square overflow-hidden rounded-[8px] border border-border bg-card sm:aspect-[5/4] lg:aspect-square">
            <Image
              src="/images/brand/mark-main.png"
              alt=""
              fill
              className="object-contain p-10 opacity-90 sm:p-14"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground", rtl && "font-cairo tracking-normal")}>
                {rtl ? "منصة البناء الرسمية" : "Official builder"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

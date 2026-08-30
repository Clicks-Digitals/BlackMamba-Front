import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function HomeBlackMamba() {
  const locale = await getLocale();
  const rtl = locale === "ar";

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-[#0a0a0b] py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 start-0 h-[28rem] w-[28rem] rounded-full bg-[#9e1d20]/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 end-0 h-80 w-80 rounded-full bg-[#9e1d20]/12 blur-[100px]"
        aria-hidden
      />

      <div className="layout-page layout-gutter-x relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn(rtl && "lg:order-2")}>
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5">
            <Image src="/brand/bm-mark.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d12f27]">
              Black Mamba
            </span>
          </div>

          <h2
            className={cn(
              "max-w-[12ch] leading-[0.92] text-white",
              "text-[clamp(2.6rem,6.5vw,5.5rem)]",
              !rtl && "font-beckman uppercase tracking-wide",
              rtl && "font-cairo font-bold"
            )}
          >
            {rtl ? "ابنِ جهازك الأسطوري" : "Build Your Dream PC"}
          </h2>

          <p
            className={cn(
              "mt-5 max-w-md text-white/50",
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
                  "rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5",
                  "text-[11px] font-medium text-white/65",
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
                "inline-flex h-11 items-center justify-center rounded-md bg-primary px-7 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#d12f27] sm:h-12 sm:px-8",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "ابدأ البناء" : "Start Building"}
            </Link>
            <Link
              href="/pc-builder/parts"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-md border border-white/15 px-7 text-sm font-semibold text-white/70 transition-colors duration-200 hover:border-white/30 hover:text-white sm:h-12 sm:px-8",
                rtl && "font-cairo"
              )}
            >
              {rtl ? "تصفح القطع" : "Browse Parts"}
            </Link>
          </div>
        </div>

        <div className={cn("relative", rtl && "lg:order-1")}>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-[#111214] sm:aspect-[5/4] lg:aspect-square">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 70% 20%, rgba(158,29,32,0.35), transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(158,29,32,0.18), transparent 50%)",
              }}
            />
            <Image
              src="/images/Black-mamba-Logo.png"
              alt=""
              fill
              className="object-contain p-10 opacity-90 sm:p-14"
              style={{ mixBlendMode: "screen" }}
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40", rtl && "font-cairo tracking-normal")}>
                {rtl ? "منصة البناء الرسمية" : "Official builder"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

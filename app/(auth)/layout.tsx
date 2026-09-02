import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Truck, ShieldCheck, Award, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/brand-logo";

export const metadata: Metadata = {
  title: {
    template: "%s | Black Mamba",
    default: "Black Mamba",
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [t, locale] = await Promise.all([getTranslations("Auth.Panel"), getLocale()]);
  const rtl = locale === "ar";

  const features = [
    { icon: Truck, label: t("feature1") },
    { icon: ShieldCheck, label: t("feature2") },
    { icon: Award, label: t("feature3") },
    { icon: MessageCircle, label: t("feature4") },
  ];

  return (
    <div className="dark flex min-h-screen w-full flex-col lg:flex-row">
      {/* Brand panel — desktop only */}
      <div className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-[#0d0e0e] p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 70% at 30% 40%, #000 20%, transparent 75%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #9e1d20 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #9e1d20 0%, transparent 70%)" }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.75 bg-primary" />

        <Link href="/" aria-label="Black Mamba" className="relative z-10 inline-flex items-center">
          <BrandLogo size="md" priority />
        </Link>

        <div className="relative z-10 space-y-6">
          <h2
            className={cn(
              "max-w-sm text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] text-white",
              !rtl && "font-beckman tracking-wide uppercase",
              rtl && "font-cairo font-bold"
            )}
          >
            {t("title")}
          </h2>
          <p className={cn("max-w-xs text-sm text-white/60", rtl && "font-cairo")}>
            {t("tagline")}
          </p>

          <ul className="space-y-3 pt-2">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9e1d20]/20 ring-1 ring-[#9e1d20]/35">
                  <Icon className="h-4 w-4 text-[#d12f27]" strokeWidth={1.8} />
                </span>
                <span className={cn("text-sm text-white/80", rtl && "font-cairo")}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#0d0e0e] px-4 py-10 sm:px-6 lg:py-16">
        <Link href="/" aria-label="Black Mamba" className="mb-8 inline-flex items-center lg:hidden">
          <BrandLogo size="sm" priority />
        </Link>
        <main className="w-full max-w-md">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/shared/brand-logo";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .not-found-logo  { animation: float 4s ease-in-out infinite; }
        .not-found-code  { animation: fade-up 0.6s ease-out both; }
        .not-found-title { animation: fade-up 0.6s ease-out 0.15s both; }
        .not-found-desc  { animation: fade-up 0.6s ease-out 0.28s both; }
        .not-found-btn   { animation: fade-up 0.6s ease-out 0.4s both; }
        .not-found-bg    { animation: fade-in 0.8s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .not-found-logo, .not-found-code, .not-found-title, .not-found-desc, .not-found-btn, .not-found-bg { animation: none !important; }
        }
      `}</style>

      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0e0e] overflow-hidden px-6 text-center bm-stage">

        <div
          className="not-found-bg pointer-events-none absolute -top-40 h-96 w-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #9e1d20 0%, transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Background decorative rings */}
        <div className="not-found-bg absolute w-125 h-125 rounded-full border border-white/5 pointer-events-none" />
        <div className="not-found-bg absolute w-90 h-90 rounded-full border border-white/5 pointer-events-none" />

        {/* Giant faded 404 behind everything */}
        <span
          className="not-found-bg absolute font-beckman text-[260px] sm:text-[340px] leading-none select-none pointer-events-none"
          style={{ color: "rgba(230,240,241,0.04)" }}
          aria-hidden="true"
        >
          404
        </span>

        {/* Logo */}
        <div className="not-found-logo relative z-10 mb-8">
          <BrandMark size={72} className="h-16 w-16 object-contain" />
        </div>

        {/* 404 code */}
        <h1 className="not-found-code relative z-10 font-beckman text-[96px] sm:text-[120px] leading-none text-[#EDEFF0]">
          {t("code")}
        </h1>

        {/* Title */}
        <h2 className="not-found-title relative z-10 font-chillax text-[28px] sm:text-[36px] leading-none text-[#EDEFF0]/80 mt-2">
          {t("title")}
        </h2>

        {/* Description */}
        <p className="not-found-desc relative z-10 font-chillax text-sm sm:text-base text-[#EDEFF0]/50 mt-4 max-w-sm leading-relaxed">
          {t("description")}
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="not-found-btn relative z-10 mt-10 inline-flex items-center gap-2 bg-primary text-white font-chillax font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-[#d12f27] transition-colors duration-200"
        >
          {t("backHome")}
        </Link>

        {/* Bottom line accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </>
  );
}

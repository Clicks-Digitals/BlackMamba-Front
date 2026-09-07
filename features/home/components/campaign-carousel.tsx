"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";

// ── Countdown ──────────────────────────────────────────────────────────────

function useCountdown(endsAt: string) {
  const calc = useCallback(() => {
    const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      expired: diff === 0,
    };
  }, [endsAt]);

  const [tick, setTick] = useState(calc);
  useEffect(() => {
    if (tick.expired) return;
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [tick.expired, calc]);
  return tick;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md"
        style={{ width: "clamp(44px, 6vw, 64px)", height: "clamp(44px, 6vw, 64px)" }}
      >
        <span
          className="font-chillax tabular-nums leading-none text-white"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-chillax text-[9px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}

function Dot() {
  return (
    <div className="flex flex-col gap-1 self-center pb-5">
      <span className="block h-1 w-1 rounded-full bg-white/30" />
      <span className="block h-1 w-1 rounded-full bg-white/30" />
    </div>
  );
}

function CountdownDisplay({ endsAt, isAr }: { endsAt: string; isAr: boolean }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(endsAt);
  if (expired) return null;
  const L = isAr
    ? ["يوم", "ساعة", "دقيقة", "ثانية"]
    : ["Days", "Hrs", "Min", "Sec"];
  return (
    <div className="flex items-end gap-2">
      <CountdownBox value={days} label={L[0]} />
      <Dot />
      <CountdownBox value={hours} label={L[1]} />
      <Dot />
      <CountdownBox value={minutes} label={L[2]} />
      <Dot />
      <CountdownBox value={seconds} label={L[3]} />
    </div>
  );
}

// ── Single slide ────────────────────────────────────────────────────────────

function CampaignSlide({ c, isAr }: { c: Campaign; isAr: boolean }) {
  const name = isAr && c.name_ar ? c.name_ar : c.name;
  const sub = isAr && c.subtitle_ar ? c.subtitle_ar : c.subtitle;
  const cta = isAr && c.cta_label_ar ? c.cta_label_ar : c.cta_label;

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[var(--ink)]">

      {/* ── Full-bleed image at much higher opacity ── */}
      {c.image_url && (
        <Image
          src={c.image_url}
          alt={name}
          fill
          className="object-cover object-center select-none pointer-events-none"
          style={{ opacity: 0.55 }}
          sizes="100vw"
          priority
        />
      )}

      {/* ── Directional fade so text side is fully readable ── */}
      <div
        className="absolute inset-0"
        style={{
          background: isAr
            ? "linear-gradient(to left, #000000 0%, #000000 30%, rgba(0, 0, 0,0.82) 52%, rgba(0, 0, 0,0.25) 75%, transparent 100%)"
            : "linear-gradient(to right, #000000 0%, #000000 30%, rgba(0, 0, 0,0.82) 52%, rgba(0, 0, 0,0.25) 75%, transparent 100%)",
        }}
      />

      {/* ── Bottom vignette for dot legibility ── */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/30 to-transparent" />

      {/* ── Content ── */}
      <div
        className="relative z-10 flex h-full items-center layout-gutter-x"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex flex-col gap-3 md:gap-4" style={{ maxWidth: "clamp(280px, 48%, 520px)" }}>

          {/* Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 rounded-[4px] border border-white/20 bg-black/30 px-2 py-0.5">
              <Zap className="h-3 w-3 text-primary" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-white">
                {isAr ? "عرض محدود" : "Limited Offer"}
              </span>
            </span>

            {c.discount_value && Number(c.discount_value) > 0 && (
              <span className="rounded-[4px] bg-primary px-2 py-0.5">
                <span className="text-[12px] font-semibold leading-none text-white">
                  {c.discount_type === 'PERCENTAGE'
                    ? `${Number(c.discount_value).toFixed(0)}% OFF`
                    : isAr
                    ? `وفّر ${c.discount_value}`
                    : `Save ${c.discount_value}`}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className={cn(
              "leading-none text-white",
              isAr ? "font-cairo font-black" : "font-chillax",
            )}
            style={{ fontSize: "clamp(1.35rem, 3vw, 2rem)" }}
          >
            {name}
          </h2>

          {/* Gold rule */}
          <div className="flex items-center gap-3">
            {sub && (
              <p
                className={cn(
                  "text-white/65 leading-relaxed",
                  isAr ? "font-cairo" : "font-chillax",
                )}
                style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.9375rem)" }}
              >
                {sub}
              </p>
            )}
          </div>

          {/* Countdown */}
          <CountdownDisplay endsAt={c.ends_at} isAr={isAr} />

          {/* CTA */}
          {cta && c.cta_url && (
            <Link
              href={c.cta_url}
              className={cn(
                "group mt-1 inline-flex w-fit items-center gap-2 rounded-[4px]",
                "bg-primary px-4 py-2 transition-colors duration-150",
                "hover:bg-[var(--blue-hover)]",
                isAr ? "font-cairo flex-row-reverse" : "font-chillax",
              )}
              style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)", fontWeight: 700 }}
            >
              <span className="text-white">{cta}</span>
              {isAr
                ? <ArrowLeft className="h-4 w-4 text-white" />
                : <ArrowRight className="h-4 w-4 text-white" />}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Carousel ────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 6500;

export function CampaignCarousel({ campaigns, isAr }: { campaigns: Campaign[]; isAr: boolean }) {
  const count = campaigns.length;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragX = useRef(0);

  const go = useCallback(
    (dir: 1 | -1) => setActive((p) => (p + dir + count) % count),
    [count],
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1) timerRef.current = setInterval(() => go(1), AUTOPLAY_MS);
  }, [count, go]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (count === 0) return null;

  // In RTL the flex strip lays out right-to-left, so the shift direction flips.
  const translatePct = (isAr ? 1 : -1) * (active * (100 / count));

  return (
    <section className="layout-section-y pt-2">
      <div className="layout-page layout-gutter-x">
        <div
          className="relative overflow-hidden rounded-[var(--layout-hero-radius-sm)] border border-white/8 sm:rounded-[var(--layout-hero-radius)]"
          style={{ height: "clamp(240px, 38vw, 420px)" }}
        >
      {/* ── Sliding strip ── */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
        style={{ width: `${count * 100}%`, transform: `translateX(${translatePct}%)` }}
        onMouseDown={(e) => { dragX.current = e.clientX; }}
        onMouseUp={(e) => {
          const d = e.clientX - dragX.current;
          if (Math.abs(d) > 50) { go(d < 0 ? 1 : -1); resetTimer(); }
        }}
        onTouchStart={(e) => { dragX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - dragX.current;
          if (Math.abs(d) > 40) { go(d < 0 ? 1 : -1); resetTimer(); }
        }}
      >
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="h-full"
            style={{ width: `${100 / count}%`, flexShrink: 0 }}
          >
            <CampaignSlide c={c} isAr={isAr} />
          </div>
        ))}
      </div>

      {/* ── Arrows ── */}
      {count > 1 && (
        <>
          <button
            onClick={() => { go(-1); resetTimer(); }}
            aria-label="Previous campaign"
            className="absolute start-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-black/25 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/30 hover:bg-black/40"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => { go(1); resetTimer(); }}
            aria-label="Next campaign"
            className="absolute end-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-black/25 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/30 hover:bg-black/40"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}

      {/* ── Progress dots + timer bar ── */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {campaigns.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); resetTimer(); }}
              aria-label={`Campaign ${i + 1}`}
              className="relative overflow-hidden rounded-full transition-all duration-300"
              style={{
                height: 4,
                width: i === active ? 28 : 6,
                background: i === active ? "var(--primary)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}
        </div>
      </div>
    </section>
  );
}

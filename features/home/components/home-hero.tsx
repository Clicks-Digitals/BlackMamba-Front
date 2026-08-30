"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { HomeSwiperSlide } from "../types";

type HomeHeroProps = {
  slides: HomeSwiperSlide[];
  locale: string;
  shopLabel: string;
};

const AUTOPLAY_MS = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;

function slideCopy(slide: HomeSwiperSlide, locale: string) {
  const rtl = locale === "ar";
  return {
    rtl,
    title: rtl ? slide.title_ar || slide.title : slide.title,
    subtitle: rtl ? slide.subtitle_ar || slide.subtitle : slide.subtitle,
    btn: rtl ? slide.button_text_ar || slide.button_text : slide.button_text,
    href: slide.link || "/products",
  };
}

function slideCover(slide: HomeSwiperSlide) {
  return slide.image_url || slide.image;
}

function slideMark(slide: HomeSwiperSlide) {
  const mark = slide.icon_url || slide.icon;
  const cover = slideCover(slide);
  if (!mark || mark === cover) return null;
  return mark;
}

function slideLogo(slide: HomeSwiperSlide) {
  return slide.icon_url || slide.icon || slide.image_url || slide.image;
}

export function HomeHero({ slides, locale, shopLabel }: HomeHeroProps) {
  const t = useTranslations("Home");
  const reduce = useReducedMotion();
  const valid = useMemo(() => slides.filter((s) => s.image_url || s.image), [slides]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const idxRef = useRef(0);
  const railRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  const rtl = locale === "ar";
  const n = valid.length;

  const goTo = (newIdx: number) => {
    if (!n || newIdx === idxRef.current) return;
    setIdx(newIdx);
  };

  const goPrev = () => goTo((idxRef.current - 1 + n) % n);
  const goNext = () => goTo((idxRef.current + 1) % n);

  useEffect(() => {
    if (n < 2 || paused || reduce) return;
    const id = window.setInterval(() => {
      setIdx((p) => (p + 1) % n);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [n, idx, paused, reduce]);

  useEffect(() => {
    const rail = railRef.current;
    const el = tileRefs.current[idx];
    if (!rail || !el) return;
    const left = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2;
    rail.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [idx, reduce]);

  if (n === 0) return null;

  const active = valid[idx];
  const { title, subtitle, btn, href } = slideCopy(active, locale);
  const cover = slideCover(active);
  const mark = slideMark(active);

  return (
    <section className="relative bm-stage pt-3 pb-0 sm:pt-5">
      <div className="layout-page layout-gutter-x">
        <div
          className="group/hero relative overflow-hidden rounded-lg border border-white/10 bg-[#080809]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[22rem] sm:min-h-[26rem] lg:min-h-[32rem] xl:min-h-[36rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                className="slide-active absolute inset-0"
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 55% 60% at 70% 45%, rgba(158,29,32,0.22), transparent 70%)",
                  }}
                  aria-hidden
                />
                {cover ? (
                  <Image
                    src={cover}
                    alt={title || ""}
                    fill
                    priority
                    sizes="100vw"
                    className={cn(
                      "object-contain object-center p-6 sm:p-10 lg:p-12",
                      !reduce && "animate-zoom"
                    )}
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#141516]" />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-black/20 rtl:bg-linear-to-l" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#080809] to-transparent" />

            <span className="pointer-events-none absolute start-4 top-4 z-10 h-7 w-7 border-s border-t border-[#d12f27]/70" />
            <span className="pointer-events-none absolute end-4 top-4 z-10 h-7 w-7 border-e border-t border-[#d12f27]/70" />
            <span className="pointer-events-none absolute start-4 bottom-4 z-10 h-7 w-7 border-s border-b border-[#d12f27]/70" />
            <span className="pointer-events-none absolute end-4 bottom-4 z-10 h-7 w-7 border-e border-b border-[#d12f27]/70" />

            <div className="relative z-10 flex min-h-[22rem] flex-col sm:min-h-[26rem] lg:min-h-[32rem] xl:min-h-[36rem]">
              <div className="flex flex-1 flex-col justify-end p-5 pb-6 sm:p-8 sm:pb-7 lg:p-10 lg:pb-8">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id + "-copy"}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                    className="max-w-2xl"
                  >
                    <p className="bm-kicker">{t("heroKicker")}</p>
                    {mark && (
                      <Image
                        src={mark}
                        alt=""
                        width={120}
                        height={32}
                        className="mt-3 h-7 w-auto max-w-[7.5rem] object-contain object-left rtl:object-right sm:h-8"
                        unoptimized
                      />
                    )}
                    <h1
                      className={cn(
                        "mt-3 line-clamp-3 text-white",
                        "text-[clamp(2rem,5vw,4.4rem)] leading-[0.92]",
                        !rtl && "font-beckman uppercase tracking-wide",
                        rtl && "font-cairo font-bold"
                      )}
                    >
                      {title}
                    </h1>
                    {subtitle && (
                      <p
                        className={cn(
                          "mt-3 line-clamp-2 max-w-[42ch] text-[14px] leading-relaxed text-white/60 sm:mt-4 sm:text-[16px]",
                          rtl && "font-cairo"
                        )}
                      >
                        {subtitle}
                      </p>
                    )}
                    <Link
                      href={href}
                      className={cn(
                        "group mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#d12f27] sm:mt-6",
                        rtl && "font-cairo"
                      )}
                    >
                      {btn || shopLabel}
                      <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {n > 1 && (
                <div className="flex items-center gap-3 px-5 pb-5 sm:px-8 sm:pb-6 lg:px-10">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label={t("previousSlide")}
                    className="flex size-8 items-center justify-center rounded-md border border-white/12 bg-black/40 text-white transition-colors hover:bg-primary"
                  >
                    {rtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label={t("nextSlide")}
                    className="flex size-8 items-center justify-center rounded-md border border-white/12 bg-black/40 text-white transition-colors hover:bg-primary"
                  >
                    {rtl ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </button>
                  <span className="font-mono text-[11px] tracking-wide text-white/50">
                    {t("slideOf", {
                      current: String(idx + 1).padStart(2, "0"),
                      total: String(n).padStart(2, "0"),
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {n > 1 && (
            <div className="relative border-t border-white/8 bg-[#0b0b0d]/90">
              {!reduce && (
                <div
                  key={idx}
                  className="bm-hero-progress absolute inset-x-0 top-0 z-10 h-px bg-[#d12f27]"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                  aria-hidden
                />
              )}
              <div
                ref={railRef}
                className="no-scrollbar flex gap-px overflow-x-auto"
              >
                {valid.map((slide, i) => {
                  const logo = slideLogo(slide);
                  const label = rtl ? slide.title_ar || slide.title : slide.title;
                  const selected = i === idx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      ref={(el) => {
                        tileRefs.current[i] = el;
                      }}
                      onClick={() => goTo(i)}
                      aria-label={label || t("slideOf", { current: i + 1, total: n })}
                      aria-current={selected}
                      className={cn(
                        "relative flex h-14 min-w-[4.75rem] flex-1 items-center justify-center px-3 transition-colors duration-200 sm:h-[3.75rem] sm:min-w-[5.5rem]",
                        selected ? "bg-white/6" : "bg-transparent hover:bg-white/4"
                      )}
                    >
                      {selected && (
                        <span className="absolute inset-x-3 top-0 h-px bg-[#d12f27]" aria-hidden />
                      )}
                      {logo ? (
                        <Image
                          src={logo}
                          alt={label || ""}
                          width={96}
                          height={28}
                          className={cn(
                            "max-h-5 w-auto max-w-full object-contain transition-opacity sm:max-h-6",
                            selected ? "opacity-100" : "opacity-45 hover:opacity-80"
                          )}
                          unoptimized
                        />
                      ) : (
                        <span className="truncate text-[10px] font-medium text-white/70">
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

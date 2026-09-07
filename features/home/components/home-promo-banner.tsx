"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import type { HomeBanner } from "../types";

type Props = {
  banners: HomeBanner[];
  locale: string;
};

/**
 * Admin-controlled banner height (set per-slide in the dashboard). All slides
 * in the carousel render at the same height, so the active/first banner's
 * size drives it. "compact" matches the slim reference design proportions.
 */
const SIZE_HEIGHTS: Record<HomeBanner["size"], string> = {
  compact: "clamp(220px,24vw,360px)",
  standard: "clamp(240px,34vw,480px)",
  tall: "clamp(260px,47.3vw,681px)",
};

/** Title scales down with the banner height so it never overflows a short slide. */
const TITLE_SIZES: Record<HomeBanner["size"], string> = {
  compact: "clamp(1.2rem,2vw,1.75rem)",
  standard: "clamp(1.35rem,2.4vw,2rem)",
  tall: "clamp(1.5rem,2.8vw,2.25rem)",
};

function BannerSlide({
  banner,
  locale,
  priority,
}: {
  banner: HomeBanner;
  locale: string;
  priority?: boolean;
}) {
  const rtl = locale === "ar";
  const title = rtl ? banner.title_ar || banner.title : banner.title;
  const subtitle = rtl ? banner.subtitle_ar || banner.subtitle : banner.subtitle;
  const btnText = rtl ? banner.button_text_ar || banner.button_text : banner.button_text;
  const titleSize = TITLE_SIZES[banner.size] ?? TITLE_SIZES.compact;

  return (
    <div className="h-full w-full">
      <div className="relative h-full w-full">
        {banner.media_type === "video" && banner.file_url ? (
          <video
            src={banner.file_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : banner.file_url ? (
          <Image
            src={banner.file_url}
            alt={title || "Banner"}
            fill
            sizes="100vw"
            className="object-cover"
            priority={priority}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-12 top-0 flex flex-col items-start justify-center gap-3 ps-[clamp(20px,6vw,80px)] md:gap-5 max-w-[min(640px,90vw)]">
          {title && (
            <h2
              className={cn(
                "leading-[1.15] font-semibold text-white",
                rtl ? "font-cairo font-bold" : "font-chillax"
              )}
              style={{ fontSize: titleSize }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={cn(
                "max-w-[clamp(220px,40vw,520px)] text-[clamp(13px,1.3vw,18px)] font-medium leading-relaxed text-white/75",
                rtl && "font-cairo"
              )}
            >
              {subtitle}
            </p>
          )}
          {btnText && (
            banner.link ? (
              <Link
                href={banner.link}
                className="inline-flex h-9 items-center justify-center rounded-[4px] bg-primary px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[var(--blue-hover)]"
              >
                {btnText}
              </Link>
            ) : (
              <span
                className="inline-flex h-9 items-center justify-center rounded-[4px] bg-primary px-4 text-[13px] font-semibold text-white"
              >
                {btnText}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function HomePromoBanner({ banners, locale }: Props) {
  const valid = banners.filter((b) => b.active && b.file_url);
  const rtl = locale === "ar";

  const [plugins] = useState(() => [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setCurrent(embla.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (valid.length === 0) return null;

  // Carousel slides render at a uniform height — driven by the first active
  // banner's admin-configured size.
  const bannerHeight = SIZE_HEIGHTS[valid[0].size] ?? SIZE_HEIGHTS.compact;

  const arrowCls =
    "hidden md:flex z-20 size-8 rounded-[4px] border-0 bg-black/40 text-white shadow-none hover:bg-black/60";

  return (
    <section className="layout-section-y pt-4 sm:pt-6">
      <div className="layout-page layout-gutter-x">
        <div
          className="relative overflow-hidden rounded-[var(--layout-hero-radius-sm)] border border-white/8 sm:rounded-[var(--layout-hero-radius)]"
          style={{ minHeight: bannerHeight }}
        >
      <Carousel
        plugins={plugins}
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          direction: rtl ? "rtl" : "ltr",
        }}
        dir={rtl ? "rtl" : "ltr"}
        className="size-full"
      >
        <CarouselContent className="ml-0 size-full">
          {valid.map((banner, i) => (
            <CarouselItem
              key={banner.id}
              className="basis-full pl-0"
              style={{ minHeight: bannerHeight }}
            >
              <BannerSlide banner={banner} locale={locale} priority={i === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {valid.length > 1 && (
          <>
            <CarouselPrevious className={cn(arrowCls, "inset-s-4 md:inset-s-6")} />
            <CarouselNext className={cn(arrowCls, "inset-e-4 md:inset-e-6")} />
          </>
        )}
      </Carousel>

      {valid.length > 1 && (
        <div className="absolute bottom-6 inset-s-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rtl:translate-x-1/2">
          {valid.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Banner slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}
        </div>
      </div>
    </section>
  );
}

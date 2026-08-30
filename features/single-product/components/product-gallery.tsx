"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslations } from "next-intl";
import type { gallaryItem } from "@/types";
import { useProductImageStore } from "@/stores/product-image-store";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images?: gallaryItem[] | null;
  thumbnail: string | null;
  productName: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductGallery({ images, thumbnail, productName }: ProductGalleryProps) {
  const t = useTranslations("SingleProduct");
  const reduce = useReducedMotion();
  const galleryImages = (images ?? []).filter((g) => g.file_type === "IMAGE");
  const galleryUrls = galleryImages.map((g) => g.file);
  const allImages: string[] = thumbnail
    ? [thumbnail, ...galleryUrls.filter((url) => url !== thumbnail)]
    : galleryUrls;

  const primaryImage = galleryImages.find((g) => g.is_primary)?.file ?? allImages[0] ?? "";
  const [active, setActive] = useState<string>(primaryImage);
  const [zoomed, setZoomed] = useState(false);
  const [cue, setCue] = useState(false);
  const cueTimer = useRef<number>(0);
  const activeVariationImage = useProductImageStore((s) => s.activeVariationImage);
  const setActiveVariationImage = useProductImageStore((s) => s.setActiveVariationImage);

  const displayedImage = activeVariationImage ?? active;
  const hasMultiple = allImages.length > 1;
  const currentIndex = allImages.indexOf(displayedImage);
  const displayIndex = currentIndex >= 0 ? currentIndex : 0;

  useEffect(() => {
    return () => {
      setActiveVariationImage(null);
      window.clearTimeout(cueTimer.current);
    };
  }, [setActiveVariationImage]);

  useEffect(() => {
    const onCue = () => {
      setCue(true);
      window.clearTimeout(cueTimer.current);
      cueTimer.current = window.setTimeout(() => setCue(false), 700);
    };
    window.addEventListener("bm-pdp-cart-cue", onCue);
    return () => window.removeEventListener("bm-pdp-cart-cue", onCue);
  }, []);

  const showImage = (src: string) => {
    setZoomed(false);
    setActiveVariationImage(null);
    setActive(src);
  };

  const navigate = (dir: 1 | -1) => {
    const next = (displayIndex + dir + allImages.length) % allImages.length;
    showImage(allImages[next]);
  };

  if (!allImages.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-white/10 bg-[#101112] text-white/25">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-3">
      {hasMultiple && (
        <div className="no-scrollbar hidden md:flex md:w-[4.5rem] md:shrink-0 md:flex-col md:gap-2">
          {allImages.map((src, i) => {
            const isActive = displayedImage === src;
            return (
              <button
                key={src + i}
                type="button"
                onClick={() => showImage(src)}
                className={cn(
                  "relative aspect-square w-full shrink-0 overflow-hidden rounded-md border bg-[#101112] transition-all duration-200",
                  isActive
                    ? "border-[#d12f27] opacity-100 shadow-[0_0_0_1px_rgba(209,47,39,0.35)]"
                    : "border-white/10 opacity-50 hover:border-white/25 hover:opacity-90"
                )}
              >
                <Image src={src} alt="" fill className="object-contain p-1" unoptimized />
              </button>
            );
          })}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          className={cn(
            "group relative overflow-hidden rounded-lg border bg-[#101112] transition-[border-color] duration-300",
            cue ? "bm-pdp-cue border-[#d12f27]" : "border-white/10"
          )}
          style={{ aspectRatio: "1 / 1" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 55% 50% at 50% 58%, rgba(158,29,32,0.16), transparent 70%)",
            }}
            aria-hidden
          />
          <span className="pointer-events-none absolute start-3 top-3 z-10 h-6 w-6 border-s border-t border-[#d12f27]/70" />
          <span className="pointer-events-none absolute end-3 top-3 z-10 h-6 w-6 border-e border-t border-[#d12f27]/70" />
          <span className="pointer-events-none absolute start-3 bottom-3 z-10 h-6 w-6 border-s border-b border-[#d12f27]/70" />
          <span className="pointer-events-none absolute end-3 bottom-3 z-10 h-6 w-6 border-e border-b border-[#d12f27]/70" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayedImage}
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: zoomed ? 1.38 : 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src={displayedImage}
                alt={productName}
                fill
                className="pointer-events-none object-contain p-5 sm:p-8"
                unoptimized
                priority
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={cn("absolute inset-0 z-[1]", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
            aria-label={zoomed ? t("zoomOut") : t("zoomIn")}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute start-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/12 bg-black/55 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary"
                aria-label={t("previousImage")}
              >
                <ChevronLeft size={18} strokeWidth={2.5} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="absolute end-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/12 bg-black/55 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary"
                aria-label={t("nextImage")}
              >
                <ChevronRight size={18} strokeWidth={2.5} className="rtl:rotate-180" />
              </button>
            </>
          )}

          <div className="pointer-events-none absolute bottom-3 start-3 z-10 flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md border border-white/12 bg-black/50 text-white/70">
              {zoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
            </span>
            {hasMultiple && (
              <span className="rounded-md border border-white/12 bg-black/50 px-2.5 py-1.5 font-mono text-[11px] tracking-wide text-white/70">
                {t("imageOf", {
                  current: String(displayIndex + 1).padStart(2, "0"),
                  total: String(allImages.length).padStart(2, "0"),
                })}
              </span>
            )}
          </div>
        </div>

        {hasMultiple && (
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {allImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => showImage(allImages[i])}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  displayIndex === i ? "w-5 bg-[#d12f27]" : "w-1.5 bg-white/25"
                )}
                aria-label={t("imageOf", { current: i + 1, total: allImages.length })}
              />
            ))}
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto md:hidden">
          {allImages.map((src, i) => {
            const isActive = displayedImage === src;
            return (
              <button
                key={src + i}
                type="button"
                onClick={() => showImage(src)}
                className={cn(
                  "relative aspect-square w-[3.75rem] shrink-0 overflow-hidden rounded-md border bg-[#101112] transition-all duration-200",
                  isActive ? "border-[#d12f27] opacity-100" : "border-white/10 opacity-50"
                )}
              >
                <Image src={src} alt="" fill className="object-contain p-1" unoptimized />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

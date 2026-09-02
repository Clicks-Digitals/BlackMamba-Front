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
      <div className="flex aspect-square w-full items-center justify-center rounded-md border border-border bg-card text-muted-foreground/40">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "group relative overflow-hidden rounded-md border bg-card transition-[border-color] duration-300",
          cue ? "bm-pdp-cue border-primary" : "border-border"
        )}
        style={{ aspectRatio: "1 / 1" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={displayedImage}
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: zoomed ? 1.35 : 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={displayedImage}
              alt={productName}
              fill
              className="pointer-events-none object-contain p-4 sm:p-6"
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
              className="absolute start-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background/85 text-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-white"
              aria-label={t("previousImage")}
            >
              <ChevronLeft size={16} strokeWidth={2.5} className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="absolute end-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background/85 text-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-white"
              aria-label={t("nextImage")}
            >
              <ChevronRight size={16} strokeWidth={2.5} className="rtl:rotate-180" />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute bottom-2 end-2 z-10">
          <span className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/85 text-muted-foreground">
            {zoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
          </span>
        </div>
      </div>

      {hasMultiple && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          {allImages.map((src, i) => {
            const isActive = displayedImage === src;
            return (
              <button
                key={src + i}
                type="button"
                onClick={() => showImage(src)}
                className={cn(
                  "relative aspect-square w-[4.25rem] shrink-0 overflow-hidden rounded-md border bg-card transition-all duration-200 sm:w-[4.75rem]",
                  isActive
                    ? "border-primary opacity-100"
                    : "border-border opacity-55 hover:border-muted-foreground/50 hover:opacity-100"
                )}
              >
                <Image src={src} alt="" fill className="object-contain p-1.5" unoptimized />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

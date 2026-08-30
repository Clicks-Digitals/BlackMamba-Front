"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
  activeSlugs: Set<string>;
  locale: string;
  onToggle: (slug: string) => void;
  variant?: "default" | "hero";
  showBackButton?: boolean;
  onBack?: () => void;
};

export function ProductsCategoriesRow({
  categories,
  activeSlugs,
  locale,
  onToggle,
  variant = "default",
  showBackButton,
  onBack
}: Props) {
  const rtl = locale === "ar";

  // Use categories as-is (pre-filtered by caller)
  const items = categories;

  const childSlugsByRoot = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of categories) {
      if (!c.parent) continue;
      const list = map.get(c.parent) ?? [];
      list.push(c.slug);
      map.set(c.parent, list);
    }
    return map;
  }, [categories]);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  if (items.length === 0) return null;

  const isHero = variant === "hero";

  return (
    <div className="relative">
      {canPrev && (
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          aria-label="Previous"
          className="absolute inset-s-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          aria-label="Next"
          className="absolute inset-e-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white"
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      )}

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
          containScroll: "trimSnaps",
          direction: rtl ? "rtl" : "ltr"
        }}
        className="px-5 md:px-9"
      >
        <CarouselContent className={cn("py-1", isHero ? "-ml-3" : "-ml-2")}>
          {isHero && showBackButton && onBack && (
            <CarouselItem className="basis-auto pl-3">
              <button
                type="button"
                onClick={onBack}
                className="group flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-2 ring-white/40 transition-all group-hover:ring-white/70 md:size-20">
                  <ArrowLeft
                    className={cn("size-5 text-white/80 md:size-6", rtl && "rotate-180")}
                  />
                </span>
                <span className="max-w-20 truncate text-[11px] font-medium text-white/60 transition-colors group-hover:text-white/85 md:max-w-24 md:text-[12px]">
                  {rtl ? "رجوع" : "Back"}
                </span>
              </button>
            </CarouselItem>
          )}
          {items.map((cat) => {
            const name = rtl ? cat.name_ar || cat.name : cat.name;
            const childSlugs = childSlugsByRoot.get(cat.id) ?? [];
            const isSelf = activeSlugs.has(cat.slug);
            const hasActiveChild = childSlugs.some((s) => activeSlugs.has(s));
            const isActive = isSelf || hasActiveChild;

            if (isHero) {
              return (
                <CarouselItem key={cat.id} className="basis-auto pl-3">
                  <button
                    type="button"
                    onClick={() => onToggle(cat.slug)}
                    className="group flex shrink-0 flex-col items-center gap-1.5"
                  >
                    <span
                      className={cn(
                        "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-2 transition-all md:size-20",
                        isActive ? "ring-primary" : "ring-transparent group-hover:ring-white/30"
                      )}
                    >
                      {cat.image_url || cat.image ? (
                        <Image
                          src={cat.image_url || cat.image}
                          alt={name}
                          fill
                          sizes="(min-width: 768px) 80px, 64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-chillax text-xl text-white/70 md:text-2xl">
                          {name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "max-w-20 truncate text-[11px] font-medium transition-colors md:max-w-24 md:text-[12px]",
                        isActive ? "text-white" : "text-white/60 hover:text-white/85"
                      )}
                    >
                      {name}
                    </span>
                  </button>
                </CarouselItem>
              );
            }

            return (
              <CarouselItem key={cat.id} className="basis-auto pl-2">
                <button
                  type="button"
                  onClick={() => onToggle(cat.slug)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border py-1.5 ps-1.5 pe-4 text-[13px] font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-white/10 bg-card text-foreground hover:border-primary hover:text-foreground"
                  )}
                >
                  <span className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/5">
                    {cat.image_url || cat.image ? (
                      <Image
                        src={cat.image_url || cat.image}
                        alt={name}
                        fill
                        sizes="24px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-[10px] font-bold">{name.charAt(0)}</span>
                    )}
                  </span>
                  {name}
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

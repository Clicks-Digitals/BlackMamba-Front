"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
  locale: string;
};

export function SubHeaderCategories({ categories, locale }: Props) {
  const rtl = locale === "ar";
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

  if (categories.length === 0) return null;

  return (
    <div className="relative min-w-0 flex-1">
      {canPrev && (
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          aria-label="Previous"
          className="absolute inset-s-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-store-subnav-fg transition-colors duration-200 hover:bg-white/20"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          aria-label="Next"
          className="absolute inset-e-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-store-subnav-fg transition-colors duration-200 hover:bg-white/20"
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      )}
      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true, containScroll: "trimSnaps", direction: rtl ? "rtl" : "ltr" }}
        className={cn(canPrev && "ps-8", canNext && "pe-8")}
      >
        <CarouselContent className="-ml-0.5">
          {categories.map((cat) => (
            <CarouselItem key={cat.id} className="basis-auto pl-0.5">
              <Link
                href={`/products?category_slug=${cat.slug}`}
                className="block whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium text-white/55 transition-colors duration-200 hover:bg-white/8 hover:text-white"
              >
                {rtl ? cat.name_ar || cat.name : cat.name}
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

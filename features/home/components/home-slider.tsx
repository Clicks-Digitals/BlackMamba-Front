"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode[];
  rtl?: boolean;
  showArrows?: boolean;
  arrowVariant?: "dark" | "light";
  className?: string;
  itemClassName?: string;
  contentClassName?: string;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number;
};

export function HomeSlider({
  children,
  rtl = false,
  showArrows = true,
  arrowVariant = "dark",
  className,
  itemClassName,
  contentClassName,
  loop = true,
  autoPlay = true,
  autoPlayDelay = 3000,
}: Props) {
  const [plugins] = useState(() =>
    autoPlay
      ? [Autoplay({ delay: autoPlayDelay, stopOnInteraction: false })]
      : []
  );

  if (!children.length) return null;

  const arrowBase =
    "static size-8 translate-x-0 translate-y-0 rounded-none border border-border shadow-none transition-colors duration-150 disabled:opacity-30";
  const arrowStyle =
    arrowVariant === "light"
      ? "bg-card text-foreground hover:border-primary/40 hover:bg-primary hover:text-white"
      : "bg-primary/10 text-foreground hover:bg-primary hover:text-white";

  return (
    <div className={cn("relative", className)}>
      <Carousel
        plugins={plugins}
        opts={{
          align: "start",
          loop: loop && children.length > 2,
          dragFree: true,
          containScroll: "trimSnaps",
          direction: rtl ? "rtl" : "ltr",
        }}
        dir={rtl ? "rtl" : "ltr"}
        className="relative w-full"
      >
        <CarouselContent className={cn("-ml-3 py-1 md:-ml-3.5", contentClassName)}>
          {children.map((child, i) => (
            <CarouselItem
              key={i}
              className={cn(
                "basis-[72%] pl-3 sm:basis-64 md:basis-72 md:pl-3.5",
                itemClassName
              )}
            >
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>

        {showArrows && children.length > 1 ? (
          <div className="bm-slider-arrows mt-3 flex items-center justify-end gap-2">
            <CarouselPrevious className={cn(arrowBase, arrowStyle)} />
            <CarouselNext className={cn(arrowBase, arrowStyle)} />
          </div>
        ) : null}
      </Carousel>
    </div>
  );
}

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
    "static size-11 translate-x-0 translate-y-0 rounded-full border border-white/10 shadow-none transition-colors disabled:opacity-30";
  const arrowStyle =
    arrowVariant === "light"
      ? "bg-white/8 text-white hover:border-primary/40 hover:bg-primary hover:text-white"
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
        <CarouselContent className="-ml-4 py-2 md:-ml-5">
          {children.map((child, i) => (
            <CarouselItem
              key={i}
              className={cn("basis-[72%] pl-4 sm:basis-64 md:basis-72 md:pl-5", itemClassName)}
            >
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>

        {showArrows && children.length > 1 ? (
          <div className="mt-6 flex items-center justify-end gap-2">
            <CarouselPrevious className={cn(arrowBase, arrowStyle)} />
            <CarouselNext className={cn(arrowBase, arrowStyle)} />
          </div>
        ) : null}
      </Carousel>
    </div>
  );
}

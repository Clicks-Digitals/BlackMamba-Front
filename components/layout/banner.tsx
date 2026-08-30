"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types/offer";

interface BannerProps {
  offers: Offer[];
}

export function Banner({ offers }: BannerProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const getText = (offer: Offer) => {
    return isArabic && offer.text_ar ? offer.text_ar : offer.text;
  };

  const activeOffers = offers.filter((o) => o.is_active);
  const marqueeItems = [...activeOffers, ...activeOffers];

  if (activeOffers.length === 0) return null;

  return (
    <div className="flex h-(--layout-banner-height) w-full shrink-0 items-center bg-black px-2 text-white md:px-8">
      <div className="layout-page overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_96px,black_calc(100%-96px),transparent_100%)] md:mask-[linear-gradient(to_right,transparent_0,black_128px,black_calc(100%-128px),transparent_100%)]">
        <div className="banner-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="banner-wrapper" aria-hidden={copy === 1}>
              {marqueeItems.map((offer, index) => (
                <React.Fragment key={`${copy}-${index}-${offer.id}`}>
                  {offer.link ? (
                    <li className="flex shrink-0 list-none">
                      <Link
                        href={offer.link}
                        className="flex shrink-0 items-center gap-2 px-0 whitespace-nowrap sm:px-5 md:px-10"
                      >
                        <p className="text-sm sm:text-base">{getText(offer)}</p>
                      </Link>
                    </li>
                  ) : (
                    <li
                      className={cn(
                        "flex shrink-0 items-center gap-2 px-0 whitespace-nowrap sm:px-5 md:px-10"
                      )}
                    >
                      <p className="text-sm sm:text-base">{getText(offer)}</p>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

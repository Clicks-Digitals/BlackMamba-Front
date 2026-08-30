"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import type { OfferSection } from "@/features/home";

export function AnnouncementBar({ offers }: { offers: OfferSection[] }) {
  const [dismissed, setDismissed] = useState(false);
  const locale = useLocale();
  const rtl = locale === "ar";

  const active = offers.filter((o) => o.is_active && (rtl ? o.text_ar || o.text : o.text));

  // Hidden entirely when the CMS has no active offer, or the user dismissed it.
  if (active.length === 0 || dismissed) return null;

  const getText = (o: OfferSection) => (rtl ? o.text_ar || o.text : o.text) as string;

  const single = active.length === 1;

  // Repeat the offers enough times so a single track copy is wider than the
  // viewport — this keeps the marquee gap-free and the -50% loop seamless
  // regardless of how few (or how short) the offers are.
  const repeatTimes = Math.max(2, Math.ceil(12 / active.length));
  const marqueeItems = Array.from({ length: repeatTimes }, () => active).flat();

  return (
    <div className="relative flex items-center border-b border-white/6 bg-[#0b0b0d] py-1.5 text-white">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      {single ? (
        // One offer → static, centered.
        <div className="flex w-full items-center justify-center px-10">
          <OfferText offer={active[0]} text={getText(active[0])} />
        </div>
      ) : (
        // Multiple offers → seamless marquee (duplicated track for the loop).
        <div className="w-full overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_64px,black_calc(100%-64px),transparent_100%)]">
          <div className="banner-track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="banner-wrapper" aria-hidden={copy === 1}>
                {marqueeItems.map((offer, index) => (
                  <li
                    key={`${copy}-${index}`}
                    className="flex shrink-0 items-center px-6 whitespace-nowrap sm:px-10"
                  >
                    <OfferText offer={offer} text={getText(offer)} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-opacity hover:opacity-60"
        aria-label="Close announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function OfferText({ offer, text }: { offer: OfferSection; text: string }) {
  const content = <p className="text-[11px] font-bold sm:text-[13px]">{text}</p>;
  return offer.link ? (
    <Link href={offer.link} className="hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}

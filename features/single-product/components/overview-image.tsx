"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  heading: string;
  headingClassName: string;
};

/**
 * The dedicated overview image is CMS/admin-supplied and can fail to load —
 * 404, or a malformed file that fetches fine but can't be decoded (e.g. an
 * invalid XML byte in an SVG). Either way a broken image still reserves its
 * declared width/height, leaving a large blank gap in the page — so on
 * failure we drop the whole section instead of showing an empty box under
 * a heading.
 *
 * A malformed-but-fetched image doesn't always fire the DOM `error` event,
 * so success is also verified on `load` via naturalWidth/naturalHeight.
 */
export function OverviewImage({ src, alt, heading, headingClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const checkLoaded = useCallback(() => {
    const img = imgRef.current;
    if (img && img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    // A malformed-but-fetched image (e.g. an invalid byte in an SVG) can
    // leave the element "complete" without ever firing load or error — so
    // poll briefly instead of trusting either event alone.
    checkLoaded();
    const id = window.setInterval(checkLoaded, 200);
    const timeout = window.setTimeout(() => window.clearInterval(id), 3000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [checkLoaded]);

  if (failed) return null;

  return (
    <section className="border-y border-border bg-background py-8 sm:py-12" id="overview">
      <div className="layout-page layout-gutter-x">
        <h2 className={cn(headingClassName)}>{heading}</h2>
        <div className="overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={1600}
            height={4800}
            className="block h-auto w-full object-contain object-top"
            onError={() => setFailed(true)}
            onLoad={checkLoaded}
          />
        </div>
      </div>
    </section>
  );
}

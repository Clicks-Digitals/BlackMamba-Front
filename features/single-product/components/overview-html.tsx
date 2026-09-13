"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  dir: "rtl" | "ltr";
  className: string;
};

/**
 * CMS-authored HTML can reference images that 404 (e.g. an asset the
 * content team hasn't uploaded yet). A broken <img> still reserves its
 * declared width/height, leaving a large blank gap. Since this markup is
 * injected via dangerouslySetInnerHTML we can't attach onError through
 * JSX, so we wire it up imperatively after mount instead.
 */
export function OverviewHtml({ html, dir, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const images = Array.from(root.querySelectorAll("img"));
    const handleError = (e: Event) => {
      const img = e.currentTarget as HTMLImageElement;
      const collapsible = img.closest("figure, picture") ?? img;
      collapsible.remove();
    };

    for (const img of images) {
      if (img.complete && img.naturalWidth === 0) {
        handleError({ currentTarget: img } as unknown as Event);
        continue;
      }
      img.addEventListener("error", handleError);
    }

    return () => {
      for (const img of images) img.removeEventListener("error", handleError);
    };
  }, [html]);

  return (
    <div
      ref={ref}
      dir={dir}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

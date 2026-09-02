"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export function HeaderChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const next = el.getBoundingClientRect().height;
      setHeight(next);
      document.documentElement.style.setProperty("--layout-chrome-top", `${Math.round(next)}px`);
    };
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div ref={ref} className="fixed inset-x-0 top-0 z-40 bg-store-nav">
        {children}
      </div>
      <div
        aria-hidden
        className={height == null ? "h-[var(--layout-chrome-top)]" : undefined}
        style={height != null ? { height } : undefined}
      />
    </>
  );
}

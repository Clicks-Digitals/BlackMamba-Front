"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders `children` only once the spot comes within `rootMargin` of the
 * viewport; until then, a placeholder of `minHeight`.
 *
 * The home page built and hydrated all eight product rows - 83 cards, some
 * 3,900 elements - on load, and the browser spent seconds on it before the
 * page answered a tap. Rows below the first now arrive as they are
 * scrolled to.
 */
export function DeferredRender({
  children,
  minHeight = 480,
  rootMargin = "800px",
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  if (shown) return <>{children}</>;
  return <div ref={ref} style={{ minHeight }} aria-hidden />;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);
  const doneRef = useRef(false);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startCrawl(from = 15) {
    clearTimer();
    setActive(true);
    setWidth(from);
    let w = from;
    intervalRef.current = setInterval(() => {
      w += (88 - w) * 0.12;
      setWidth(Math.min(w, 88));
    }, 180);
  }

  function finish() {
    clearTimer();
    setWidth(100);
    doneRef.current = true;
    const t = setTimeout(() => {
      setActive(false);
      setWidth(0);
      doneRef.current = false;
    }, 380);
    return () => clearTimeout(t);
  }

  // Complete when pathname changes (new page rendered)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Start on link click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";

      // Ignore fragment, mailto, tel, external
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname && url.search === window.location.search) return;
      } catch { return; }

      startCrawl();
    }

    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("click", handleClick, true);
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="nav-progress"
          className="pointer-events-none fixed top-0 left-0 z-[99999] h-[2px] bg-primary shadow-[0_0_8px_var(--primary)]"
          style={{ width: `${width}%`, transformOrigin: "left center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.15 } }}
        />
      )}
    </AnimatePresence>
  );
}

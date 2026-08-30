"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Storefront page enter: a 300–450ms crimson sweep + a short layered reveal.
 * Skipped on Build Your PC so that cinematic builder entrance stays intact.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const skip = pathname.startsWith("/pc-builder");

  if (skip || reduce) {
    return <>{children}</>;
  }

  return (
    <>
      <RouteSweep pathname={pathname} />
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

function RouteSweep({ pathname }: { pathname: string }) {
  const [tick, setTick] = useState(pathname);

  useEffect(() => {
    setTick(pathname);
  }, [pathname]);

  return (
    <AnimatePresence>
      <motion.div
        key={tick}
        className="pointer-events-none fixed inset-x-0 top-0 z-[99990] h-px origin-left bg-[#d12f27] shadow-[0_0_18px_#9e1d20]"
        initial={{ scaleX: 0, opacity: 0.9 }}
        animate={{ scaleX: 1, opacity: [0.9, 0.9, 0] }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left center" }}
        aria-hidden
      />
    </AnimatePresence>
  );
}

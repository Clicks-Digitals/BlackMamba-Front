"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useBuilderMotion } from "./builder-motion";

export function EnergyBeam() {
  const { pulseSlot, pulseKey, pulseKind, reduceMotion, assembling } = useBuilderMotion();
  const rtl = useLocale() === "ar";
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    if (!pulseSlot || reduceMotion || assembling) {
      setPath(null);
      return;
    }
    const from = document.querySelector(`[data-slot-row="${pulseSlot}"]`);
    const chassisNodes = document.querySelectorAll("[data-live-chassis]");
    let to: Element | null = null;
    chassisNodes.forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width > 8 && r.height > 8) to = n;
    });
    if (!from || !to) return;

    const a = from.getBoundingClientRect();
    const b = (to as Element).getBoundingClientRect();
    const xRow = rtl ? a.left : a.right;
    const yRow = a.top + a.height / 2;
    const xCase = b.left + b.width * (rtl ? 0.65 : 0.35);
    const yCase = b.top + b.height * 0.42;
    const x1 = pulseKind === "remove" ? xCase : xRow;
    const y1 = pulseKind === "remove" ? yCase : yRow;
    const x2 = pulseKind === "remove" ? xRow : xCase;
    const y2 = pulseKind === "remove" ? yRow : yCase;
    const cx = (x1 + x2) / 2;
    setPath(`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`);

    const timer = window.setTimeout(() => setPath(null), 480);
    return () => window.clearTimeout(timer);
  }, [pulseSlot, pulseKey, pulseKind, reduceMotion, assembling, rtl]);

  if (!path) return null;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-30 hidden lg:block"
      width="100%"
      height="100%"
      aria-hidden
    >
      <path className="bm-energy-path" d={path} />
    </svg>
  );
}


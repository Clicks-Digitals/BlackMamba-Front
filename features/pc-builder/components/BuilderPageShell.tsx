"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { BrandLogo, BrandMark } from "@/components/shared/brand-logo";

export function BuilderPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bm-builder-stage relative min-h-screen overflow-x-hidden bg-[#0d0e0e] text-[#EDEFF0]">
      <div className="bm-builder-grid pointer-events-none absolute inset-0" aria-hidden />
      <BuilderSpotlight />
      <div
        className="pointer-events-none absolute -top-40 start-[-10%] h-[32rem] w-[32rem] rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, #9e1d20 0%, transparent 68%)", filter: "blur(90px)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 end-[-12%] h-[28rem] w-[28rem] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #d12f27 0%, transparent 70%)", filter: "blur(110px)" }}
        aria-hidden
      />
      <CircuitHeader />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" aria-hidden />

      <div className="relative z-10 layout-page layout-gutter-x pb-28 pt-8 md:pt-10 lg:pb-16">{children}</div>
    </div>
  );
}

function CircuitHeader() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 w-full"
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path className="bm-circuit-line" d="M0 48 H180 L210 18 H420" />
      <path className="bm-circuit-line" style={{ animationDelay: "0.16s" }} d="M1440 36 H1180 L1148 72 H920" />
      <path className="bm-circuit-line" style={{ animationDelay: "0.28s" }} d="M320 92 H520 L548 64 H760" />
    </svg>
  );
}

function BuilderSpotlight() {
  const reduce = useReducedMotion();
  const pos = useRef({ x: 0, y: 0 });
  const node = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    if (!mq.matches) return;
    setReady(true);
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = node.current;
        if (!el) return;
        el.style.transform = `translate3d(${pos.current.x - 160}px, ${pos.current.y - 160}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  if (!ready) return null;

  return (
    <div
      ref={node}
      className="pointer-events-none fixed top-0 left-0 z-[1] hidden size-80 rounded-full opacity-40 mix-blend-screen lg:block"
      style={{
        background: "radial-gradient(circle, rgba(158,29,32,0.22) 0%, transparent 70%)",
        willChange: "transform",
      }}
      aria-hidden
    />
  );
}

export function BlackMambaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <BrandLogo size={size} />;
}

export function BlackMambaMark({ size = 32, className }: { size?: number; className?: string }) {
  return <BrandMark size={size} className={className} />;
}

export function BuilderBadge({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#9e1d20]/45 bg-[#9e1d20]/12 px-3 py-1.5">
      <BlackMambaMark size={14} />
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d12f27] sm:text-[11px]">
        {children}
      </span>
    </div>
  );
}

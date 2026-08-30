"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import type { PCSlot } from "@/features/pc-builder/types";

export const BUILDER_EASE = [0.22, 1, 0.36, 1] as const;

type PulseKind = "add" | "remove";

type BuilderMotionValue = {
  reduceMotion: boolean;
  assembling: boolean;
  setAssembling: (v: boolean) => void;
  pulseSlot: PCSlot | null;
  pulseKind: PulseKind;
  pulseKey: number;
  triggerPulse: (slot: PCSlot, kind?: PulseKind) => void;
  activeSlot: PCSlot | null;
  mobileSummaryOpen: boolean;
  setMobileSummaryOpen: (v: boolean) => void;
  motionReady: boolean;
  setMotionReady: (v: boolean) => void;
};

const BuilderMotionContext = createContext<BuilderMotionValue | null>(null);

export function BuilderMotionProvider({
  children,
  activeSlot,
}: {
  children: ReactNode;
  activeSlot: PCSlot | null;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [assembling, setAssembling] = useState(false);
  const [pulseSlot, setPulseSlot] = useState<PCSlot | null>(null);
  const [pulseKind, setPulseKind] = useState<PulseKind>("add");
  const [pulseKey, setPulseKey] = useState(0);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  const triggerPulse = useCallback((slot: PCSlot, kind: PulseKind = "add") => {
    setPulseSlot(slot);
    setPulseKind(kind);
    setPulseKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({
      reduceMotion,
      assembling,
      setAssembling,
      pulseSlot,
      pulseKind,
      pulseKey,
      triggerPulse,
      activeSlot,
      mobileSummaryOpen,
      setMobileSummaryOpen,
      motionReady,
      setMotionReady,
    }),
    [
      reduceMotion,
      assembling,
      pulseSlot,
      pulseKind,
      pulseKey,
      triggerPulse,
      activeSlot,
      mobileSummaryOpen,
      motionReady,
    ]
  );

  return <BuilderMotionContext.Provider value={value}>{children}</BuilderMotionContext.Provider>;
}

export function useBuilderMotion() {
  const ctx = useContext(BuilderMotionContext);
  if (!ctx) {
    return {
      reduceMotion: false,
      assembling: false,
      setAssembling: (_v: boolean) => {},
      pulseSlot: null as PCSlot | null,
      pulseKind: "add" as PulseKind,
      pulseKey: 0,
      triggerPulse: (_slot: PCSlot, _kind?: PulseKind) => {},
      activeSlot: null as PCSlot | null,
      mobileSummaryOpen: false,
      setMobileSummaryOpen: (_v: boolean) => {},
      motionReady: false,
      setMotionReady: (_v: boolean) => {},
    };
  }
  return ctx;
}

export function fadeUp(delay: number, reduce: boolean) {
  if (reduce) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: BUILDER_EASE },
  };
}

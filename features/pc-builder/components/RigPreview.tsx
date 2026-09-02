"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePCBuilderStore } from "@/stores/pc-builder-store";
import { CORE_SLOTS, type PCSlot } from "@/features/pc-builder/types";
import { useBuilderMotion } from "./builder-motion";

/**
 * Live mid-tower illustration. Filled slots read as hardware;
 * empty bays stay dim. Visual-only — does not change picker or cart behaviour.
 */
export function RigPreview({ className }: { className?: string }) {
  const t = useTranslations("PCBuilder");
  const uid = useId().replace(/:/g, "");
  const items = usePCBuilderStore((s) => s.items);
  const colorPref = usePCBuilderStore((s) => s.preferences.preference_color);
  const hasBlockingIssues = usePCBuilderStore((s) => s.hasBlockingIssues);
  const compatibility = usePCBuilderStore((s) => s.compatibility);
  const { assembling, reduceMotion, motionReady } = useBuilderMotion();
  const filledCount = CORE_SLOTS.filter((slot) => items[slot]).length;
  const hasParts = filledCount > 0;
  const complete = filledCount === CORE_SLOTS.length && !hasBlockingIssues;
  const [systemOn, setSystemOn] = useState(true);
  const [bootScan, setBootScan] = useState(true);
  const [clickPulse, setClickPulse] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const completeOnce = useRef(false);
  const bootTimer = useRef<number>(0);
  const whiteCase = colorPref === "WHITE";
  const live = systemOn;

  const isFilled = (slot: PCSlot) => !!items[slot];
  const partLabel = (slot: PCSlot, fallback: string) => {
    const name = items[slot]?.product_details?.name;
    if (!name) return fallback;
    const compact = name
      .replace(/NVIDIA GeForce /i, "")
      .replace(/GeForce /i, "")
      .replace(/AMD Ryzen \d+\s*/i, "")
      .replace(/Ryzen \d+\s*/i, "")
      .replace(/\bAMD\b /i, "")
      .replace(/\bIntel\b /i, "")
      .replace(/MSI MAG /i, "")
      .replace(/\bMSI\b /i, "")
      .replace(/G\.Skill Trident Z5 /i, "")
      .replace(/Thermalright /i, "")
      .replace(/Lian Li /i, "")
      .replace(/Samsung /i, "")
      .replace(/Corsair /i, "")
      .replace(/^Windows 11 Pro$/i, "Win 11")
      .replace(/ WiFi/i, "")
      .replace(/ \d+GB$/i, "")
      .replace(/ Gold$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const max = slot === "GPU" || slot === "MOTHERBOARD" ? 14 : 12;
    return compact.length > max ? compact.slice(0, max).trim() : compact;
  };
  const alertSlots = new Set(
    [...compatibility.red_issues, ...compatibility.yellow_issues].map((issue) => issue.slot)
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setBootScan(false), 1800);
    return () => {
      window.clearTimeout(timer);
      if (bootTimer.current) window.clearTimeout(bootTimer.current);
    };
  }, []);

  useEffect(() => {
    if (complete && systemOn && !completeOnce.current) {
      completeOnce.current = true;
      setCelebrate(true);
      const timer = window.setTimeout(() => setCelebrate(false), 1600);
      return () => window.clearTimeout(timer);
    }
    if (!complete || !systemOn) completeOnce.current = false;
  }, [complete, systemOn]);

  function togglePower() {
    setClickPulse((n) => n + 1);
    if (systemOn) {
      if (bootTimer.current) window.clearTimeout(bootTimer.current);
      setBootScan(false);
      setSystemOn(false);
      return;
    }
    setSystemOn(true);
    if (!reduceMotion) setBootScan(true);
    bootTimer.current = window.setTimeout(() => setBootScan(false), reduceMotion ? 0 : 950);
  }

  const caseStroke = (isFilled("CASE") || complete) && live ? "#d12f27" : whiteCase ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.16)";

  return (
    <div className={cn("relative", className)} data-live-chassis>
      <p className="mb-2 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
        <span>{t("hud.chassis")}</span>
        <span className={cn("tracking-[0.14em]", live ? "text-[#d12f27]" : "text-white/30")}>
          {live ? t("hud.powerOn") : t("hud.powerOff")}
        </span>
      </p>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border p-2 sm:p-3",
          "border-white/10 bg-[#070808] transition-[border-color,box-shadow,background-color] duration-300",
          whiteCase && "border-white/18 bg-[#121314]",
          live && hasParts && "border-[#9e1d20]/35 shadow-[0_0_48px_-18px_rgba(158,29,32,0.7)]",
          ((isFilled("CASE") || filledCount >= 4) && live) && "shadow-[0_0_52px_-14px_rgba(158,29,32,0.8)]",
          complete && live && "border-[#d12f27]/55 shadow-[0_0_56px_-12px_rgba(209,47,39,0.85)]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 60% 45% at 58% 38%, rgba(158,29,32,${live ? 0.16 : 0.04}), transparent 70%)`,
          }}
          aria-hidden
        />
        {!live && <div className="bm-ambient-sweep" aria-hidden />}
        {bootScan && live && !reduceMotion && <div className="bm-boot-scan" key={clickPulse} aria-hidden />}
        {assembling && !reduceMotion && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="bm-assemble-scan" />
          </div>
        )}

        <svg viewBox="0 0 240 320" className="relative z-10 h-auto w-full" role="img" aria-label={t("hud.chassis")}>
          <defs>
            <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={whiteCase ? "#3a3d42" : "#24262a"} />
              <stop offset="45%" stopColor={whiteCase ? "#2a2c30" : "#16181b"} />
              <stop offset="100%" stopColor={whiteCase ? "#1c1e22" : "#0c0d0e"} />
            </linearGradient>
            <linearGradient id={`cavity-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#121314" />
              <stop offset="100%" stopColor="#070808" />
            </linearGradient>
            <linearGradient id={`pcb-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isFilled("MOTHERBOARD") ? "#1b241c" : "#141516"} />
              <stop offset="100%" stopColor={isFilled("MOTHERBOARD") ? "#101612" : "#101112"} />
            </linearGradient>
            <linearGradient id={`gpu-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isFilled("GPU") ? "#2a2d32" : "#18191b"} />
              <stop offset="55%" stopColor={isFilled("GPU") ? "#14161a" : "#121314"} />
              <stop offset="100%" stopColor={isFilled("GPU") ? "#0e1013" : "#0c0d0e"} />
            </linearGradient>
            <linearGradient id={`glass-${uid}`} x1="0.15" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="28%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="62%" stopColor="rgba(158,29,32,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            <linearGradient id={`ram-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2a2d30" />
              <stop offset="40%" stopColor="#9e1d20" />
              <stop offset="100%" stopColor="#3a1012" />
            </linearGradient>
            <pattern id={`fins-${uid}`} width="2.2" height="8" patternUnits="userSpaceOnUse">
              <rect width="1.1" height="8" fill="#3a3d42" />
              <rect x="1.1" width="1.1" height="8" fill="#1e2024" />
            </pattern>
            <pattern id={`mesh-${uid}`} width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.7" fill="rgba(255,255,255,0.07)" />
            </pattern>
            <pattern id={`grill-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="1.4" fill="#2a2c30" />
              <rect y="2" width="4" height="1.4" fill="#141618" />
            </pattern>
            <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#000" floodOpacity="0.45" />
            </filter>
            <filter id={`glow-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id={`window-${uid}`}>
              <rect x="38" y="22" width="178" height="276" rx="5" />
            </clipPath>
          </defs>

          {celebrate && live && !reduceMotion && (
            <rect x="12" y="6" width="216" height="308" rx="8" fill="none" stroke="#d12f27" strokeWidth="1.25" className="bm-case-ring" />
          )}

          <rect x="14" y="8" width="212" height="304" rx="7" fill={`url(#metal-${uid})`} stroke={caseStroke} strokeWidth="1.6" />
          <rect x="18" y="12" width="204" height="294" rx="5" fill={`url(#cavity-${uid})`} />
          <rect x="28" y="308" width="22" height="5" rx="1" fill="#1a1c1e" />
          <rect x="190" y="308" width="22" height="5" rx="1" fill="#1a1c1e" />

          <rect x="18" y="22" width="18" height="274" rx="2" fill={whiteCase ? "#d8dadd" : "#0e0f10"} />
          <rect x="20" y="40" width="14" height="200" fill={`url(#mesh-${uid})`} />
          <g
            className={cn(
              "cursor-pointer outline-none focus:outline-none focus-visible:outline-none",
              clickPulse > 0 && "bm-power-click"
            )}
            role="button"
            tabIndex={0}
            aria-pressed={live}
            aria-label={live ? t("hud.powerOff") : t("hud.powerOn")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              togglePower();
              e.currentTarget.blur();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                togglePower();
              }
            }}
          >
            <circle cx="27" cy="50" r="10" fill="transparent" />
            <circle cx="27" cy="50" r="5.6" fill="#0a0b0c" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle
              cx="27"
              cy="50"
              r="4"
              className={live ? "bm-led-live" : undefined}
              fill={live ? "#d12f27" : "#2a2d30"}
              filter={live ? `url(#glow-${uid})` : undefined}
            />
            <circle cx="27" cy="50" r="1.3" fill={live ? "#ffb0b0" : "#4a4e54"} />
          </g>
          <circle cx="27" cy="64" r="2" fill={live ? "#edeff0" : "#2a2d30"} />
          <rect x="23" y="80" width="8" height="16" rx="1" fill="#1a1c1e" stroke="rgba(255,255,255,0.1)" />
          <rect x="23" y="100" width="8" height="7" rx="1" fill="#1a1c1e" />
          <rect x="23" y="112" width="8" height="7" rx="1" fill="#1a1c1e" />
          <rect x="208" y="22" width="10" height="274" fill="#0c0d0e" />

          <g clipPath={`url(#window-${uid})`}>
            <rect x="38" y="22" width="178" height="276" fill="#0a0b0c" />
            <path d="M42 28 H210 V50 Q180 70 42 58 Z" fill="rgba(255,255,255,0.03)" />

            <SlotGroup filled={isFilled("MOTHERBOARD")} assembling={assembling} index={1} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("MOTHERBOARD")} enter={{ opacity: 0, y: 8 }}>
              <rect x="50" y="56" width="148" height="168" rx="3" fill={`url(#pcb-${uid})`} stroke={isFilled("MOTHERBOARD") ? "#3d5a40" : "rgba(255,255,255,0.1)"} strokeDasharray={isFilled("MOTHERBOARD") ? "0" : "4 3"} />
              {isFilled("MOTHERBOARD") && (
                <>
                  <path d="M58 78 h36 M58 86 h24 M58 118 h40 M170 90 v48 M64 150 h70" stroke="#6a8f4e" strokeWidth="0.7" opacity="0.55" fill="none" />
                  <rect x="54" y="62" width="28" height="10" rx="1" fill="#2a2e32" />
                  <rect x="56" y="64" width="24" height="3" fill="#9e1d20" opacity="0.5" />
                  <rect x="168" y="70" width="22" height="36" rx="1" fill="#25282c" />
                  <rect x="170" y="74" width="18" height="4" fill="#3a3d42" />
                  <rect x="170" y="82" width="18" height="4" fill="#3a3d42" />
                  <rect x="170" y="90" width="18" height="4" fill="#3a3d42" />
                  <rect x="54" y="196" width="36" height="8" rx="1" fill="#1a1c1e" />
                  <text x="56" y="72" fill="rgba(237,239,240,0.45)" fontSize="3.6" letterSpacing="0.3">
                    {partLabel("MOTHERBOARD", "BOARD")}
                  </text>
                </>
              )}
              {!isFilled("MOTHERBOARD") && (
                <text x="124" y="140" textAnchor="middle" fill="rgba(237,239,240,0.28)" fontSize="5">
                  MOTHERBOARD
                </text>
              )}
            </SlotGroup>

            <SlotGroup filled={isFilled("CPU")} assembling={assembling} index={0} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("CPU")} enter={{ opacity: 0, scale: 1.12 }} snap>
              <rect x="96" y="96" width="32" height="32" rx="1.5" fill={isFilled("CPU") ? "#c5c8cc" : "#1a1b1d"} stroke={isFilled("CPU") ? "#8a8e94" : "rgba(255,255,255,0.12)"} />
              {isFilled("CPU") && (
                <>
                  <rect x="100" y="100" width="24" height="24" rx="0.5" fill="#9aa0a8" />
                  <rect x="103" y="103" width="18" height="18" fill="#6a7078" />
                </>
              )}
              <text x="112" y="136" textAnchor="middle" fill={isFilled("CPU") ? "rgba(237,239,240,0.7)" : "rgba(237,239,240,0.35)"} fontSize="3.6">
                {partLabel("CPU", "CPU")}
              </text>
            </SlotGroup>

            {[0, 1, 2, 3].map((i) => {
              const dimmOn = isFilled("RAM") && i < 2;
              return (
                <SlotGroup key={i} filled={dimmOn} assembling={assembling} index={2} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("RAM")} enter={{ opacity: 0, y: -10 }} delayExtra={i * 0.06}>
                  <rect
                    x={154 + i * 9}
                    y="82"
                    width="6"
                    height="56"
                    rx="0.8"
                    fill={dimmOn ? `url(#ram-${uid})` : "#17191b"}
                    stroke={dimmOn && live ? "#d12f27" : "rgba(255,255,255,0.1)"}
                    filter={dimmOn && live ? `url(#glow-${uid})` : undefined}
                  />
                  {dimmOn && live && <rect x={154.8 + i * 9} y="84" width="4.4" height="2" rx="0.4" fill="#d12f27" />}
                </SlotGroup>
              );
            })}

            <SlotGroup filled={isFilled("CPU_COOLER")} assembling={assembling} index={4} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("CPU_COOLER")} enter={{ opacity: 0, y: -12 }}>
              <rect x="86" y="70" width="18" height="52" fill={`url(#fins-${uid})`} stroke="#2a2c30" />
              <rect x="120" y="70" width="18" height="52" fill={`url(#fins-${uid})`} stroke="#2a2c30" />
              <rect x="102" y="78" width="20" height="4" rx="1" fill="#4a5058" />
              <rect x="102" y="88" width="20" height="4" rx="1" fill="#4a5058" />
              <rect x="102" y="98" width="20" height="4" rx="1" fill="#4a5058" />
              <g transform="translate(86 96)">
                <CaseFan spinning={live && isFilled("CPU_COOLER")} lit={live && isFilled("CPU_COOLER")} r={11} boost={celebrate && live} />
              </g>
              <g transform="translate(147 96)">
                <CaseFan spinning={live && isFilled("CPU_COOLER")} lit={live && isFilled("CPU_COOLER")} r={11} boost={celebrate && live} />
              </g>
            </SlotGroup>

            <SlotGroup filled={isFilled("GPU")} assembling={assembling} index={3} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("GPU")} enter={{ opacity: 0, x: -22 }}>
              <g filter={`url(#soft-${uid})`}>
                <rect x="48" y="172" width="8" height="40" rx="1" fill={isFilled("GPU") ? "#1a1c1e" : "#141516"} stroke="rgba(255,255,255,0.12)" />
                {isFilled("GPU") && (
                  <>
                    <rect x="49.5" y="176" width="5" height="4" rx="0.4" fill="#1e3a5f" />
                    <rect x="49.5" y="182" width="5" height="4" rx="0.4" fill="#1e3a5f" />
                    <rect x="49.5" y="188" width="5" height="3" rx="0.4" fill="#c9a227" />
                  </>
                )}
                <rect x="56" y="174" width="140" height="36" rx="2.5" fill={`url(#gpu-${uid})`} stroke={isFilled("GPU") ? "#9e1d20" : "rgba(255,255,255,0.1)"} />
                {isFilled("GPU") && live && <rect x="56" y="174" width="140" height="2" fill="#d12f27" opacity="0.85" />}
                <g transform="translate(78 192)">
                  <CaseFan spinning={live && isFilled("GPU")} lit={live && isFilled("GPU")} r={10} boost={celebrate && live} />
                </g>
                <g transform="translate(108 192)">
                  <CaseFan spinning={live && isFilled("GPU")} lit={live && isFilled("GPU")} r={10} boost={celebrate && live} />
                </g>
                <g transform="translate(138 192)">
                  <CaseFan spinning={live && isFilled("GPU")} lit={live && isFilled("GPU")} r={10} boost={celebrate && live} />
                </g>
                <text x="154" y="196" fill={isFilled("GPU") ? "rgba(237,239,240,0.82)" : "rgba(237,239,240,0.28)"} fontSize="3.8" fontWeight="600">
                  {partLabel("GPU", "GPU")}
                </text>
              </g>
            </SlotGroup>

            <SlotGroup filled={isFilled("STORAGE")} assembling={assembling} index={7} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("STORAGE")} enter={{ opacity: 0 }}>
              <rect x="58" y="152" width="42" height="12" rx="1" fill={isFilled("STORAGE") ? "#1c1e22" : "#141516"} stroke={isFilled("STORAGE") ? "#9e1d20" : "rgba(255,255,255,0.1)"} />
              {isFilled("STORAGE") && (
                <>
                  <rect x="60" y="154" width="38" height="3" fill="#2a2c30" />
                  <rect x="60" y="158" width="10" height="4" rx="0.4" fill="#9e1d20" opacity="0.7" />
                </>
              )}
              <text x="79" y="168" textAnchor="middle" fill={isFilled("STORAGE") ? "rgba(237,239,240,0.65)" : "rgba(237,239,240,0.3)"} fontSize="3.4">
                {partLabel("STORAGE", "M.2")}
              </text>
            </SlotGroup>

            <SlotGroup filled={isFilled("PSU")} assembling={assembling} index={5} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("PSU")} enter={{ opacity: 0 }}>
              <rect x="48" y="248" width="150" height="38" rx="2" fill={isFilled("PSU") ? "#1a1c20" : "#121314"} stroke={isFilled("PSU") ? "#3a3d42" : "rgba(255,255,255,0.1)"} />
              <rect x="52" y="252" width="52" height="30" fill={`url(#grill-${uid})`} />
              {isFilled("PSU") && (
                <>
                  <path d="M108 258 C 130 240, 150 230, 168 210" fill="none" stroke="#2a1416" strokeWidth="2.4" />
                  <path d="M112 266 C 128 250, 140 246, 154 228" fill="none" stroke="#1a1c1e" strokeWidth="2" />
                  <path d="M108 258 C 130 240, 150 230, 168 210" fill="none" stroke="#9e1d20" strokeWidth="0.6" opacity={live ? 0.45 : 0} />
                  <circle cx="188" cy="267" r="2" className={live ? "bm-led-live" : undefined} fill={live ? "#d12f27" : "#2a2d30"} />
                </>
              )}
              <text x="158" y="272" fill={isFilled("PSU") ? "rgba(237,239,240,0.7)" : "rgba(237,239,240,0.3)"} fontSize="3.6">
                {partLabel("PSU", "PSU")}
              </text>
            </SlotGroup>

            <g transform="translate(198 248)">
              <CaseFan spinning={live} lit={live} r={12} dim boost={celebrate && live} />
            </g>

            <rect
              x="38"
              y="22"
              width="178"
              height="276"
              fill="#020303"
              style={{ opacity: live ? 0 : 0.72, transition: "opacity 0.45s ease" }}
              pointerEvents="none"
            />
          </g>

          <rect x="38" y="22" width="178" height="276" rx="5" fill={`url(#glass-${uid})`} stroke="rgba(255,255,255,0.14)" opacity={live ? 1 : 0.35} />
          <path d="M48 30 L92 30 L70 86 L42 70 Z" fill="rgba(255,255,255,0.07)" />

          <SlotGroup filled={isFilled("OS")} assembling={assembling} index={8} reduce={reduceMotion} ready={motionReady} alert={alertSlots.has("OS")} enter={{ opacity: 0, scale: 0.75 }}>
            <rect x="188" y="28" width="22" height="11" rx="2" fill={isFilled("OS") && live ? "#9e1d20" : "#17181b"} stroke={isFilled("OS") && live ? "#d12f27" : "rgba(255,255,255,0.16)"} />
            <text x="199" y="36" textAnchor="middle" fill="#edeff0" fontSize="4" fontWeight="600">
              {isFilled("OS") ? "WIN" : "OS"}
            </text>
          </SlotGroup>
        </svg>
        <p className="mt-2 text-center text-[10px] text-white/35">{t("hud.powerHint")}</p>
      </div>
    </div>
  );
}

function SlotGroup({
  filled,
  assembling,
  index,
  reduce,
  ready,
  alert,
  enter,
  snap,
  delayExtra = 0,
  children,
}: {
  filled: boolean;
  assembling: boolean;
  index: number;
  reduce: boolean;
  ready: boolean;
  alert: boolean;
  enter: { opacity?: number; x?: number; y?: number; scale?: number };
  snap?: boolean;
  delayExtra?: number;
  children: React.ReactNode;
}) {
  const prev = useRef(filled);
  const [enterKey, setEnterKey] = useState(0);

  useEffect(() => {
    if (!ready) {
      prev.current = filled;
      return;
    }
    if (filled && !prev.current) setEnterKey((k) => k + 1);
    prev.current = filled;
  }, [filled, ready]);

  const play = enterKey > 0 && filled && !reduce;
  const delay = assembling && filled ? index * 0.07 + delayExtra : delayExtra;
  const opacity = filled ? 1 : 0.28;

  return (
    <g
      opacity={opacity}
      style={{
        transformOrigin: "center",
        transformBox: "fill-box",
        filter: alert ? "drop-shadow(0 0 4px rgba(255,107,112,0.65))" : undefined,
      }}
    >
      {play ? (
        <motion.g
          initial={enter}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={
            snap
              ? { type: "spring", stiffness: 420, damping: 22, delay }
              : { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {children}
        </motion.g>
      ) : (
        children
      )}
    </g>
  );
}

function CaseFan({
  spinning,
  lit,
  dim,
  boost,
  r = 10,
}: {
  spinning: boolean;
  lit?: boolean;
  dim?: boolean;
  boost?: boolean;
  r?: number;
}) {
  const cls = boost ? "bm-fan-boost" : spinning ? "bm-fan-spin" : undefined;
  const blades = [0, 51, 102, 153, 204, 255, 306];
  return (
    <g className={cls} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle r={r + 1.2} fill="#0c0d0e" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
      <circle r={r} fill={dim ? "#101112" : "#16181b"} />
      {blades.map((angle) => (
        <path
          key={angle}
          d={`M 0 ${-r * 0.18} Q ${r * 0.42} ${-r * 0.12} ${r * 0.72} ${-r * 0.55} Q ${r * 0.2} ${-r * 0.55} 0 ${-r * 0.18}`}
          transform={`rotate(${angle})`}
          fill={lit || spinning ? "#4a1c1e" : "rgba(255,255,255,0.16)"}
        />
      ))}
      <circle r={r * 0.28} fill={dim ? "#1a1c1e" : "#222428"} stroke="rgba(255,255,255,0.12)" />
      <circle r={r * 0.1} fill={lit || spinning ? "#d12f27" : "#3a3d40"} />
    </g>
  );
}

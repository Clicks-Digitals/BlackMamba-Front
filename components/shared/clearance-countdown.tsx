"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function getRemaining(endIso: string) {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ClearanceSaleCountdown({ endIso }: { endIso: string }) {
  const [rem, setRem] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    setRem(getRemaining(endIso));
    const id = setInterval(() => setRem(getRemaining(endIso)), 1000);
    return () => clearInterval(id);
  }, [endIso]);

  if (!rem) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 bg-linear-to-r from-orange-600 to-red-600 px-2 py-1">
      <Flame className="size-3 shrink-0 text-orange-200" aria-hidden />
      <div className="flex items-center gap-0.5" dir="ltr">
        {rem.d > 0 && (
          <>
            <Digit value={rem.d} label="d" />
            <Sep />
          </>
        )}
        <Digit value={rem.h} label="h" />
        <Sep />
        <Digit value={rem.m} label="m" />
        <Sep />
        <Digit value={rem.s} label="s" />
      </div>
    </div>
  );
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-px">
      <span className="font-mono text-[11px] font-bold tabular-nums text-white leading-none">
        {pad(value)}
      </span>
      <span className="text-[8px] font-semibold text-orange-200 leading-none">{label}</span>
    </span>
  );
}

function Sep() {
  return <span className="text-[10px] font-bold text-orange-300 leading-none mx-px">:</span>;
}

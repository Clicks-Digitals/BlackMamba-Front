"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe, Coins } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

export function AppLoader() {
  const { isAppLoading, switchTarget } = useUiStore((s) => s);
  const isLocale = switchTarget?.type === "locale";

  return (
    <AnimatePresence>
      {isAppLoading && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            key="card"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="flex min-w-[200px] flex-col items-center gap-5 rounded-[12px] bg-[#000000] px-10 py-8 shadow-2xl ring-1 ring-white/8"
          >
            {/* Icon circle */}
            <motion.div
              animate={
                isLocale
                  ? { rotate: 360 }
                  : { y: [0, -6, 0] }
              }
              transition={
                isLocale
                  ? { duration: 2, repeat: Infinity, ease: "linear" }
                  : { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
              }
              className={[
                "flex h-14 w-14 items-center justify-center rounded-full",
                isLocale ? "bg-primary/15" : "bg-primary/15",
              ].join(" ")}
            >
              {isLocale
                ? <Globe size={28} className="text-[#EB0B1A]" />
                : <Coins size={28} className="text-[#EB0B1A]" />
              }
            </motion.div>

            {/* Label */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {isLocale ? "Switching Language" : "Switching Currency"}
            </p>

            {/* Target code / symbol */}
            {switchTarget && (
              <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 280 }}
                className={[
                  "text-5xl font-bold text-[#EB0B1A]",
                ].join(" ")}
              >
                {switchTarget.symbol ?? switchTarget.code}
              </motion.span>
            )}

            {/* Target full name */}
            {switchTarget && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-sm font-medium text-white/70"
              >
                {switchTarget.name}
              </motion.p>
            )}

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                  className={[
                    "h-1.5 w-1.5 rounded-full bg-[#EB0B1A]",
                  ].join(" ")}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

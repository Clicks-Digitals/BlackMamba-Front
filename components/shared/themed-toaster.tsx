"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SonnerToaster
      position="top-center"
      richColors={false}
      // Sonner pauses a toast's timer while it is hovered. A tap on a touch
      // screen leaves the toast in that hovered state, so it never dismissed.
      closeButton
      duration={3000}
      visibleToasts={3}
      gap={8}
      // Clear the fixed header so a toast is never half-hidden behind it.
      offset={{ top: "calc(var(--layout-chrome-top, 64px) + 12px)" }}
      mobileOffset={{ top: "calc(var(--layout-chrome-top, 56px) + 8px)" }}
      theme={mounted && resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        // Theme tokens, so the toast is readable in light mode too.
        classNames: {
          toast:
            "font-sans border border-border bg-card text-foreground shadow-lg",
          title: "text-foreground",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-muted text-foreground",
          closeButton: "border-border bg-card text-muted-foreground hover:text-foreground",
          error: "border-primary/60 bg-card text-foreground",
          success: "border-emerald-500/40 bg-card text-foreground",
        },
      }}
    />
  );
}

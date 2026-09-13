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
      theme={mounted && resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        classNames: {
          toast: "font-sans border-white/12 bg-black text-white",
          title: "text-white",
          description: "text-white/65",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-white/10 text-white",
          error: "border-primary bg-black text-white",
          success: "border-white/20 bg-black text-white",
        },
      }}
    />
  );
}

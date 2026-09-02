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
      richColors
      theme={mounted && resolvedTheme === "light" ? "light" : "dark"}
    />
  );
}

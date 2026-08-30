"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export function ScrollTopLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        window.scrollTo({ top: 0, behavior: "instant" });
        onClick?.(e);
      }}
    />
  );
}

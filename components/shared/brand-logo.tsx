import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg";

const HEIGHT: Record<BrandLogoSize, string> = {
  xs: "h-9 sm:h-10 lg:h-11",
  sm: "h-14 sm:h-16",
  md: "h-20",
  lg: "h-24",
};

type BrandLogoProps = {
  size?: BrandLogoSize;
  /** Official lockup already includes the tagline; kept for call-site compatibility. */
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Official Black Mamba lockup (`/images/Black-mamba-Logo.png`).
 * Horizontal mark + wordmark on a dark field; `mix-blend-mode: screen`
 * knocks out residual black so it sits cleanly on chrome.
 */
export function BrandLogo({ size = "md", className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/images/Black-mamba-Logo.png"
      alt="Black Mamba"
      width={1306}
      height={369}
      className={cn(
        "w-auto shrink-0 object-contain object-left rtl:object-right",
        HEIGHT[size],
        className
      )}
      style={{ mixBlendMode: "screen" }}
      unoptimized
      priority={priority}
    />
  );
}

/** Snake-B brandmark icon only */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/bm-mark.png"
      alt="Black Mamba"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      style={{ mixBlendMode: "screen" }}
      unoptimized
    />
  );
}

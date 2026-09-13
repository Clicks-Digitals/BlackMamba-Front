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
  /** Official lockup already includes the wordmark; kept for call-site compatibility. */
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Official Black Mamba lockup — red snake mark + italic MAMBA wordmark.
 * Use on dark surfaces (header, footer, auth).
 */
export function BrandLogo({ size = "md", className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/images/brand/logo-on-dark.png"
      alt="Black Mamba"
      width={300}
      height={67}
      className={cn(
        "w-auto shrink-0 object-contain object-left rtl:object-right",
        HEIGHT[size],
        className
      )}
      unoptimized
      priority={priority}
    />
  );
}

/** Snake brandmark icon only */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/brand/mark-red.png"
      alt="Black Mamba"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      unoptimized
    />
  );
}

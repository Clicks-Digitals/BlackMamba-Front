"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderNavProps {
  navLinks: { label: string; href: string }[];
  pcBuilderLabel: string;
  rtl: boolean;
}

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ navLinks, pcBuilderLabel, rtl }: HeaderNavProps) {
  const pathname = usePathname();
  const pcBuilderActive = isActive("/pc-builder", pathname);

  return (
    <nav
      className={cn(
        "hidden items-center gap-0.5 xl:flex",
        "text-[13px] leading-none tracking-wide",
        !rtl && "font-chillax",
        rtl && "gap-1 text-[13px] font-medium font-cairo"
      )}
    >
      {navLinks.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-2.5 py-1.5 whitespace-nowrap transition-colors duration-200",
              active
                ? "bg-white/8 text-white bm-nav-active"
                : "text-white/60 hover:bg-white/6 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}

      <Link
        href="/pc-builder"
        aria-current={pcBuilderActive ? "page" : undefined}
        className={cn(
          "ms-1 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors duration-200",
          pcBuilderActive
            ? "border-primary bg-primary text-white"
            : "border-primary/40 bg-primary/10 text-white hover:border-primary hover:bg-primary/20",
          rtl ? "font-cairo font-bold" : "text-[12px] font-semibold uppercase tracking-wider"
        )}
      >
        <span className="size-1.5 rounded-full bg-[#d12f27]" aria-hidden />
        {pcBuilderLabel}
      </Link>
    </nav>
  );
}

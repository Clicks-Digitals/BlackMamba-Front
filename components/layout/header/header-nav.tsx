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
        "hidden shrink-0 items-center xl:flex",
        "text-[13px] leading-none",
        !rtl && "font-chillax",
        rtl && "font-cairo"
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
              "inline-flex h-10 items-center px-3 whitespace-nowrap transition-colors duration-150",
              active
                ? "font-semibold text-white shadow-[inset_0_-2px_0_0_var(--primary)]"
                : "font-medium text-white/75 hover:text-white"
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
          "ms-1 inline-flex h-8 items-center bg-primary px-3 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-[var(--blue-hover)]",
          rtl && "font-cairo"
        )}
      >
        {pcBuilderLabel}
      </Link>
    </nav>
  );
}

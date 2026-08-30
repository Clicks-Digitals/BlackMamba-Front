"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function HeaderUserMenu() {
  const t = useTranslations("Header");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 bg-white/6 px-3.5 text-[13px] font-semibold text-white transition duration-200 hover:border-primary/50 hover:bg-primary sm:px-4"
      >
        {t("login")}
      </Link>
    );
  }

  const handleSignOut = async () => {
    await logout();
    router.refresh();
    router.push("/");
  };

  const initial = (user.first_name?.[0] || user.username?.[0] || "?").toUpperCase();
  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${displayName} — ${t("myAccount")}`}
        className="group inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-white shadow-none outline-none transition hover:opacity-95 focus-visible:outline-none data-[state=open]:opacity-100"
      >
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/8 text-[12px] font-semibold text-white transition group-hover:border-primary/50 group-hover:bg-primary group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            <span aria-hidden>{initial}</span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="w-auto min-w-[min(100vw-1.5rem,17.5rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[3px] border border-white/10 bg-[#161718]/98 p-0 text-foreground shadow-[0_12px_48px_-8px_rgba(0,0,0,0.45),0_4px_16px_-4px_rgba(158,29,32,0.18)] ring-1 ring-white/6 backdrop-blur-xl rounded-[8px]"
      >
        <DropdownMenuLabel className="border-b border-border/50 bg-secondary/35 px-3 py-3 font-normal sm:px-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/15 bg-[#0B0F0E] shadow-inner ring-2 ring-white/10">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[#EDEFF0]" aria-hidden>
                  {initial}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-semibold leading-tight text-header-dark">{displayName}</p>
              <p className="truncate text-xs leading-snug text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <div className="p-1.5">
          <DropdownMenuItem
            asChild
            className="cursor-pointer gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium text-header-dark [&_svg]:text-white/70 data-highlighted:bg-secondary data-highlighted:text-header-dark"
          >
            <Link href="/profile" className="flex w-full items-center gap-3 outline-none">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[3px] bg-primary/15 text-[#d12f27]">
                <UserIcon className="size-4" strokeWidth={2} />
              </span>
              <span>{t("profile")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-border/60" />
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleSignOut}
            className="cursor-pointer gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium data-highlighted:bg-destructive/10"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[3px] bg-destructive/10 text-destructive">
              <LogOut className="size-4" strokeWidth={2} />
            </span>
            <span>{t("signOut")}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, ShoppingBag, Headset, ShieldCheck, CalendarDays } from "lucide-react";
import { ProfileInfoTab, AddressesTab, OrdersTab, SupportTab } from "@/features/profile";
import { CreateTicketDialog } from "@/features/profile/components/tabs/support/create-ticket-dialog";
import type { User as UserType } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/date";

const VALID_TABS = ["profile-info", "addresses", "orders", "support"] as const;
type TabValue = (typeof VALID_TABS)[number];

interface ProfileTabsProps {
  user: UserType;
}

export function ProfileTabs({ user: initialUser }: ProfileTabsProps) {
  const t = useTranslations("Profile");
  const tSupport = useTranslations("Profile.SupportTab");
  const locale = useLocale();
  const rtl = locale === "ar";
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabValue | null;
  const defaultTab: TabValue = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "profile-info";

  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketKey, setTicketKey] = useState(0);

  function openTicket() {
    setTicketKey((k) => k + 1);
    setTicketOpen(true);
  }

  // Live-update banner avatar after user changes it in the profile tab
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser ?? initialUser;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const initials =
    [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    user.username?.[0]?.toUpperCase() ||
    "U";

  const tabs = [
    { value: "profile-info", icon: User,       label: t("profileInfo") },
    { value: "addresses",    icon: MapPin,      label: t("addresses")   },
    { value: "orders",       icon: ShoppingBag, label: t("orders")      },
    { value: "support",      icon: Headset,     label: t("support")     },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bm-page-hero">
        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden">
          {/* Decorative background rings */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/3" />
          <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/4" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-white/2" />

          <div className="relative layout-page layout-gutter-x pb-6 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {rtl ? "حسابي" : "My Account"}
              </p>
              <button
                type="button"
                onClick={openTicket}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground/80 transition-all hover:bg-muted hover:text-foreground"
              >
                <Headset className="h-3.5 w-3.5" />
                {tSupport("newTicket")}
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-18 w-18 overflow-hidden rounded-lg border-2 border-white/20 bg-white/10 shadow-lg sm:h-24 sm:w-24">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={fullName || user.username}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/80 sm:text-3xl">
                      {initials}
                    </div>
                  )}
                </div>
                {user.is_active && (
                  <div className="absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-2 ring-primary">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="min-w-0 flex-1 pb-0.5">
                <h1
                  className={cn(
                    "leading-none text-foreground",
                    !rtl && "font-beckman uppercase tracking-wide text-[clamp(1.9rem,4.5vw,3.75rem)]",
                    rtl  && "font-cairo font-bold normal-case text-[clamp(1.6rem,4vw,3rem)]"
                  )}
                >
                  {rtl ? `مرحباً، ${user.first_name}` : `Hello, ${user.first_name}`}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {user.email && (
                    <span className="text-[13px] text-muted-foreground">{user.email}</span>
                  )}
                  {user.is_active && (
                    <span className="flex items-center gap-1 text-[12px] font-medium text-primary">
                      <ShieldCheck className="h-3 w-3" />
                      {rtl ? "تم التحقق" : "Verified"}
                    </span>
                  )}
                  {user.created_at && (
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {rtl ? "عضو منذ" : "Member since"} {formatDateShort(user.created_at, locale)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <Tabs defaultValue={defaultTab} dir={rtl ? "rtl" : "ltr"} className="w-full">
          <div className="layout-page layout-gutter-x border-t border-border">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {tabs.map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3.5",
                    "text-[13px] font-medium text-muted-foreground transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_#EB0B1A]",
                    "data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  )}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab content ── */}
          <div className="bg-background">
            <div className="layout-page layout-gutter-x py-8">
              <TabsContent value="profile-info" className="mt-0 animate-in fade-in-50 duration-300">
                <ProfileInfoTab user={user} />
              </TabsContent>
              <TabsContent value="addresses" className="mt-0 animate-in fade-in-50 duration-300">
                <AddressesTab />
              </TabsContent>
              <TabsContent value="orders" className="mt-0 animate-in fade-in-50 duration-300">
                <OrdersTab />
              </TabsContent>
              <TabsContent value="support" className="mt-0 animate-in fade-in-50 duration-300">
                <SupportTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      <CreateTicketDialog
        key={ticketKey}
        open={ticketOpen}
        isGuest={false}
        onClose={() => setTicketOpen(false)}
        onSuccess={() => setTicketOpen(false)}
      />
    </div>
  );
}

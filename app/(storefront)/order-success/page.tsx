"use client";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTranslations("OrderSuccess");

  if (!orderId) {
    notFound();
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success(t("copyToast"));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-20 sm:px-6 md:px-12">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="mb-8 flex justify-center">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 animate-pulse rounded-full bg-green-400 opacity-15" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/5 to-[var(--ink)]/5" />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-[#17181B] shadow-lg border border-[#26292C]">
                <CheckCircle2 className="h-20 w-20 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-none text-foreground">{t("title")}</h1>
            <p className="text-lg font-light text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-6 rounded-lg border border-emerald-500/25 bg-white/3 p-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
                {t("orderNumberLabel")}
              </p>
              <div className="flex items-center justify-between rounded-lg border-b-2 border-emerald-500/50 bg-emerald-500/8 p-5">
                <p className="font-mono text-3xl font-bold tracking-widest text-[#EDEFF0] md:text-4xl">
                  {orderId.substring(0, 16).toUpperCase()}
                </p>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="rounded-lg p-3 text-emerald-400 transition-colors hover:bg-emerald-500/15"
                  aria-label={t("copyAria")}
                  title={t("copyAria")}
                >
                  <Copy size={22} />
                </button>
              </div>
              <p className="text-center text-xs text-white/40 italic">{t("copyHint")}</p>
            </div>

            <div className="border-t border-white/8 pt-6">
              <p className="text-center text-sm font-medium text-[#EDEFF0]">
                <span className="me-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                  ✓
                </span>
                {t("emailNote")}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-[#9e1d20]/15 bg-white/3 p-8">
            <h2 className="text-lg font-bold tracking-wide text-[#EDEFF0] uppercase">{t("whatsNext")}</h2>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  1
                </span>
                <span>{t("stepEmail")}</span>
              </li>
              {isAuthenticated && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    2
                  </span>
                  <span>{t("stepProfile")}</span>
                </li>
              )}
            </ul>
          </div>

          {isAuthenticated ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-lg bg-primary font-semibold tracking-wide text-white shadow-md transition-all hover:bg-[#d12f27]"
              >
                <Link href="/profile">
                  <User size={20} />
                  {t("viewProfile")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 rounded-lg border-[#9e1d20]/40 font-semibold tracking-wide text-[#EDEFF0] hover:bg-[#9e1d20]/15"
              >
                <Link href="/products">{t("continueShopping")}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-lg bg-primary font-semibold tracking-wide text-white shadow-md transition-all hover:bg-[#d12f27]"
              >
                <Link href="/products">{t("continueShopping")}</Link>
              </Button>
            </div>
          )}

          <div className="border-t border-white/8 pt-6 text-center">
            <p className="text-sm text-white/50">
              {t("support")}{" "}
              <Link
                href="/service-center"
                className="font-semibold text-[#d12f27] transition-colors hover:text-[#EDEFF0]"
              >
                {t("supportLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

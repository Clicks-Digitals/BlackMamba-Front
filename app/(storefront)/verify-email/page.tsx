import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailAction } from "@/features/auth/actions/verify-email";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;
  const rtl = (await getLocale()) === "ar";

  const result = token
    ? await verifyEmailAction(token)
    : {
        ok: false,
        message: rtl
          ? "هذا الرابط غير مكتمل."
          : "That link is incomplete.",
      };

  const copy = rtl
    ? {
        okTitle: "تم تأكيد بريدك",
        okBody: "شكرًا لك. حسابك مؤكد الآن.",
        badTitle: "تعذّر تأكيد البريد",
        shop: "تابع التسوق",
        profile: "حسابي",
      }
    : {
        okTitle: "Email confirmed",
        okBody: "Thank you. Your account is confirmed.",
        badTitle: "We couldn't confirm that",
        shop: "Continue shopping",
        profile: "My account",
      };

  return (
    <div className="layout-page layout-gutter-x flex min-h-[60vh] items-center justify-center py-16">
      <div className={cn("w-full max-w-md text-center", rtl && "font-cairo")}>
        {result.ok ? (
          <CheckCircle2
            className="mx-auto size-12 text-emerald-500"
            strokeWidth={1.5}
          />
        ) : (
          <XCircle className="mx-auto size-12 text-destructive" strokeWidth={1.5} />
        )}

        <h1 className="mt-5 text-[22px] font-semibold text-foreground">
          {result.ok ? copy.okTitle : copy.badTitle}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {result.ok ? copy.okBody : result.message}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="h-11 rounded-md bg-primary px-6 text-[12px] font-semibold uppercase leading-[2.75rem] tracking-[0.18em] text-white transition-colors hover:bg-primary/90"
          >
            {copy.shop}
          </Link>
          <Link
            href="/profile"
            className="h-11 rounded-md border border-border px-6 text-[12px] font-semibold uppercase leading-[2.75rem] tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.profile}
          </Link>
        </div>
      </div>
    </div>
  );
}

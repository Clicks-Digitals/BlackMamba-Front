"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteAccountAction } from "@/features/profile/actions/profile/delete-account";

/**
 * Closing your own account.
 *
 * There was no way for a customer to do this — staff had to do it for them.
 * Orders are kept: the order's user is detached rather than deleted, so the
 * store retains the records it needs while the person's profile goes.
 *
 * Deliberately two steps. This cannot be undone, so a single misplaced click
 * should not do it.
 */
export function DeleteAccountSection() {
  const locale = useLocale();
  const ar = locale === "ar";
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const copy = ar
    ? {
        title: "إغلاق الحساب",
        body: "سيُحذف حسابك وبياناتك الشخصية. تبقى سجلات الطلبات لدى المتجر كما يفرض القانون.",
        start: "إغلاق حسابي",
        confirm: "نعم، احذف حسابي",
        cancel: "إلغاء",
        sure: "لا يمكن التراجع عن هذا.",
      }
    : {
        title: "Close your account",
        body: "Your account and personal details are deleted. Order records stay with the store, as the law requires.",
        start: "Close my account",
        confirm: "Yes, delete my account",
        cancel: "Cancel",
        sure: "This cannot be undone.",
      };

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteAccountAction();
      if (res.ok) {
        toast.success(res.message);
        router.push("/");
        router.refresh();
      } else {
        toast.error(res.message);
        setConfirming(false);
      }
    });
  }

  return (
    <div
      className={cn(
        "mt-10 rounded-lg border border-destructive/30 bg-destructive/5 p-5",
        ar && "font-cairo"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-foreground">{copy.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{copy.body}</p>

          {confirming ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="w-full text-[13px] font-medium text-destructive">{copy.sure}</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="h-10 rounded-lg bg-destructive px-5 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {copy.confirm}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="h-10 rounded-lg border border-border px-5 text-[12.5px] font-medium text-muted-foreground transition hover:text-foreground"
              >
                {copy.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 h-10 rounded-lg border border-destructive/40 px-5 text-[12.5px] font-semibold text-destructive transition hover:bg-destructive/10"
            >
              {copy.start}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/features/auth/actions/verify-email";
import { cn } from "@/lib/utils";

/**
 * A3: accounts used to be stamped "Verified" the moment they were created,
 * with nothing sent to the address. Now the badge is earned, and an account
 * that has not earned it is told so, with a way to get the link again.
 */
export function VerifyEmailNotice({ email }: { email: string }) {
  const ar = useLocale() === "ar";
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const copy = ar
    ? {
        title: "أكّد بريدك الإلكتروني",
        body: `أرسلنا رابطًا إلى ${email}. أكّده حتى تصلك تحديثات الطلبات ولا يستطيع أحد التسجيل بهذا البريد.`,
        send: "أرسل الرابط مرة أخرى",
        sending: "جارٍ الإرسال…",
        sentLabel: "تم الإرسال",
      }
    : {
        title: "Confirm your email",
        body: `We sent a link to ${email}. Confirm it so order updates reach you, and so nobody else can sign up with this address.`,
        send: "Send the link again",
        sending: "Sending…",
        sentLabel: "Sent",
      };

  function resend() {
    startTransition(async () => {
      const res = await resendVerificationAction();
      if (res.ok) {
        setSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div
      className={cn(
        "mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5",
        ar && "font-cairo"
      )}
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-500" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-foreground">{copy.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{copy.body}</p>
          <button
            type="button"
            onClick={resend}
            disabled={isPending || sent}
            className="mt-4 h-10 rounded-lg border border-amber-500/40 px-5 text-[12.5px] font-semibold text-amber-500 transition hover:bg-amber-500/10 disabled:opacity-60"
          >
            {isPending ? copy.sending : sent ? copy.sentLabel : copy.send}
          </button>
        </div>
      </div>
    </div>
  );
}

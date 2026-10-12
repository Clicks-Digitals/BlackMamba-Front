"use client";

import { AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { toIssues } from "@/features/checkout/lib/checkout-errors";

/**
 * Lists every problem the server reported.
 *
 * Inline messages cover the fields that are on screen, but a signed-in
 * shopper's saved address has no inputs here — so a rejection like "state is
 * required" had nowhere to appear and the order just failed silently. This
 * block always shows the full list.
 */
export function CheckoutErrorSummary({
  fieldErrors,
  message,
  className,
}: {
  fieldErrors?: Partial<Record<string, string[]>>;
  message?: string;
  className?: string;
}) {
  const locale = useLocale();
  const ar = locale === "ar";
  const issues = toIssues(fieldErrors, ar ? "ar" : "en");

  if (issues.length === 0 && !message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/40 bg-destructive/5 p-4",
        ar && "font-cairo",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-destructive">
            {ar ? "تعذّر إتمام الطلب" : "We couldn't place your order"}
          </p>

          {issues.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {issues.map((issue) => (
                <li key={issue.key} className="text-[13px] leading-snug text-foreground">
                  <span className="font-medium">{issue.label}:</span>{" "}
                  <span className="text-muted-foreground">{issue.messages.join(" ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

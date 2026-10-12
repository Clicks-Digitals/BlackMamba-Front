"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { toIssues } from "@/features/checkout/lib/checkout-errors";

/**
 * Shows exactly what the server objected to.
 *
 * Inline messages cover the fields that are on screen, but a signed-in
 * shopper's saved address has no inputs here — so a rejection like "state is
 * required" had nowhere to appear and the order just failed. This block is the
 * one place every problem is guaranteed to show, so it leads with the problem
 * itself rather than a heading that repeats what the colour already says.
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
  const ref = useRef<HTMLDivElement>(null);

  // The form is long enough that the failure can land off-screen.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fieldErrors, message]);

  if (issues.length === 0 && !message) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/5 p-4",
        ar && "font-cairo",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          {issues.length > 0 ? (
            <ul className="space-y-2">
              {issues.map((issue) => (
                <li key={issue.key} className="text-[14px] leading-snug text-foreground">
                  <span className="font-semibold text-destructive">{issue.label}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span>{issue.messages.join(" ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] leading-snug font-medium text-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

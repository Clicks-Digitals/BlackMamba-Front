"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * A5: the five password rules, shown up front.
 *
 * The form advertised "at least 8 characters" and the server enforced four
 * more — revealed one per rejected attempt, so setting a password took five
 * tries. They are all listed here, and tick as you type.
 */
export const PASSWORD_RULES = [
  { key: "ruleLength", test: (v: string) => v.length >= 8 },
  { key: "ruleUppercase", test: (v: string) => /[A-Z]/.test(v) },
  { key: "ruleLowercase", test: (v: string) => /[a-z]/.test(v) },
  { key: "ruleDigit", test: (v: string) => /[0-9]/.test(v) },
  { key: "ruleSpecial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function PasswordRules({
  value,
  namespace,
  className,
}: {
  value: string;
  /** "Auth.Register" or "Auth.ResetPassword" — both carry the same keys. */
  namespace: string;
  className?: string;
}) {
  const t = useTranslations(namespace);
  const touched = value.length > 0;

  return (
    <ul className={cn("mt-2 grid gap-1 sm:grid-cols-2", className)}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 text-[11.5px] transition-colors",
              met
                ? "text-emerald-500"
                : touched
                  ? "text-white/45"
                  : "text-white/35"
            )}
          >
            {met ? (
              <Check className="size-3 shrink-0" strokeWidth={3} />
            ) : (
              <X className="size-3 shrink-0 opacity-50" strokeWidth={3} />
            )}
            <span>{t(rule.key as never)}</span>
          </li>
        );
      })}
    </ul>
  );
}

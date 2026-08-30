"use client";

import { useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewSkeleton() {
  const locale = useLocale();

  return (
    <article
      className="rounded-[12px] border border-[var(--border)] bg-card p-4 shadow-sm"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="mt-3 flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded-sm" />
        ))}
      </div>

      <Skeleton className="mt-4 h-4 w-48" />

      <div className="mt-2 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[90%]" />
        <Skeleton className="h-3.5 w-[80%]" />
      </div>
    </article>
  );
}

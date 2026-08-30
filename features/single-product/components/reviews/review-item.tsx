"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/stores";
import { useAuthStore } from "@/stores/auth-store";
import { deleteReviewAction } from "@/features/single-product";
import type { ProductReview } from "@/types";
import { Button } from "@/components/ui/button";

interface ReviewItemProps {
  review: ProductReview;
  onDeleted: () => void;
  onEdit: (review: ProductReview) => void;
}

export function ReviewItem({ review, onDeleted, onEdit }: ReviewItemProps) {
  const t = useTranslations("SingleProduct");
  const locale = useLocale();
  const { open: openConfirm } = useConfirm();
  const [isDeleting, startDelete] = useTransition();
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);
  const reviewAuthorId = review.user_id ?? review.user;
  const isOwner =
    currentUserId != null && String(reviewAuthorId) === String(currentUserId);

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    locale === "ar" ? "ar-JO" : "en-JO",
    { year: "numeric", month: "short", day: "numeric" }
  );

  function handleDelete() {
    openConfirm({
      title: t("deleteReviewTitle"),
      description: t("deleteReviewDescription"),
      confirmLabel: t("deleteReviewConfirm"),
      variant: "destructive",
      onConfirm: () => {
        startDelete(async () => {
          const res = await deleteReviewAction(review.id);
          if (res.status === "success") {
            toast.success(res.message);
            onDeleted();
          } else {
            toast.error(res.message);
          }
        });
      },
    });
  }

  return (
    <article
      className="rounded-md border border-white/8 bg-white/[0.03] p-4"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-chillax text-sm font-semibold text-foreground">
            {review.user_name?.charAt(0)?.toUpperCase() || "?"}
          </span>
          <div>
            <p className="font-chillax text-[15px] font-semibold text-foreground">{review.user_name}</p>
            <p className="font-chillax text-xs text-white/40">{formattedDate}</p>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md bg-white/8 text-white/50 transition-all duration-200 hover:bg-primary hover:text-white"
              onClick={() => onEdit(review)}
              aria-label={t("editReview")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md bg-destructive/15 text-destructive transition-all duration-200 hover:bg-destructive hover:text-white"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={t("deleteReviewAria")}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-0.5 text-amber-400" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < review.rating ? "fill-current" : "fill-transparent"}`}
            strokeWidth={1.25}
          />
        ))}
      </div>

      {review.title && (
        <h3 className="font-chillax mt-2 text-sm font-semibold text-[#EDEFF0]">{review.title}</h3>
      )}
      <p className="font-chillax mt-1 text-sm leading-relaxed whitespace-pre-wrap text-white/65">
        {review.body}
      </p>
    </article>
  );
}

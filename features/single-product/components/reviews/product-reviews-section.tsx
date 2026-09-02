"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, MessageSquareText } from "lucide-react";
import { InfiniteScroll } from "@/components/shared";
import { getProductReviews, ReviewFormDialog, ReviewItem, ReviewSkeleton } from "@/features/single-product";
import type { ProductReview } from "@/types";

interface ProductReviewsSectionProps {
  productId: string;
  avgRating?: number | null;
  reviewCount?: number;
}

function RatingSummary({ avgRating, reviewCount, t }: { avgRating: number; reviewCount: number; t: ReturnType<typeof useTranslations<"SingleProduct">> }) {
  const filled = Math.min(5, Math.max(0, Math.round(avgRating)));
  return (
    <div className="flex items-center gap-3">
      <span className="font-chillax text-[44px] leading-none text-foreground">{avgRating.toFixed(1)}</span>
      <div className="flex flex-col gap-0.5">
        <div className="flex gap-0.5 text-amber-400" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < filled ? "fill-current" : "fill-transparent"}`} strokeWidth={1.5} />
          ))}
        </div>
        <span className="font-chillax text-xs text-muted-foreground">
          {t("basedOnReviews", { count: reviewCount, reviews: t("reviews") })}
        </span>
      </div>
    </div>
  );
}

export function ProductReviewsSection({ productId, avgRating, reviewCount }: ProductReviewsSectionProps) {
  const t = useTranslations("SingleProduct");
  const [listKey, setListKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

  const bumpList = useCallback(() => setListKey((k) => k + 1), []);

  const fetchReviewsPage = useCallback(
    (page: number) => getProductReviews(page, productId),
    [productId]
  );

  function openCreate() {
    setDialogMode("create");
    setEditingReview(null);
    setDialogOpen(true);
  }

  function openEdit(review: ProductReview) {
    setDialogMode("edit");
    setEditingReview(review);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingReview(null);
  }

  return (
    <section className="bg-background" aria-labelledby="product-reviews-heading">
      <div className="layout-page layout-gutter-x py-10 sm:py-14">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-5">
            <div>
              <p className="bm-kicker mb-2">{t("reviewsTab")}</p>
              <h2
                id="product-reviews-heading"
                className="font-chillax text-[clamp(1.45rem,2.8vw,2.25rem)] leading-none tracking-wide text-foreground"
              >
                {t("reviewsHeading")}
              </h2>
            </div>
            {avgRating != null && !!reviewCount && (
              <>
                <div className="hidden h-10 w-px bg-border sm:block" aria-hidden />
                <RatingSummary avgRating={avgRating} reviewCount={reviewCount} t={t} />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 font-chillax text-sm font-medium text-white transition hover:bg-[#d12f27]"
          >
            {t("writeReview")}
          </button>
        </div>

        <ReviewFormDialog
          open={dialogOpen}
          onClose={closeDialog}
          onSuccess={bumpList}
          mode={dialogMode}
          productId={productId}
          review={editingReview}
        />

        <div
          className="max-h-[min(65vh,42rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card p-3 sm:p-4 scroll-smooth scrollbar-thin [scrollbar-gutter:stable]"
          aria-labelledby="product-reviews-heading"
          role="region"
        >
          <InfiniteScroll<ProductReview>
            key={`${productId}-${listKey}`}
            fetchAction={fetchReviewsPage}
            endMessage={t("reviewsEnd")}
            emptyState={
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-muted/30 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-foreground">
                  <MessageSquareText className="size-5" strokeWidth={1.5} />
                </div>
                <p className="font-chillax text-[15px] font-semibold text-foreground">
                  {t("noReviewsYetTitle")}
                </p>
                <p className="max-w-70 font-chillax text-sm text-muted-foreground">
                  {t("noReviewsYetBody")}
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-1 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 font-chillax text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/10"
                >
                  {t("writeReview")}
                </button>
              </div>
            }
            loadingUI={
              <div className="flex flex-col gap-4">
                <ReviewSkeleton />
                <ReviewSkeleton />
                <ReviewSkeleton />
              </div>
            }
          >
            {(reviews, isLoading) => (
              <div className="flex flex-col gap-4" aria-busy={isLoading}>
                {reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    onDeleted={bumpList}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </section>
  );
}

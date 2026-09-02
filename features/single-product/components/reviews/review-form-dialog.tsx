"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, SubmitButton, Textarea } from "@/components/forms";
import { createReviewAction, updateReviewAction, type ReviewFormData } from "@/features/single-product";

import type { ProductReview, ActionState } from "@/types";

interface ReviewFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  productId: string;
  review?: ProductReview | null;
}

const initialState: ActionState<ReviewFormData, ProductReview> = { status: "idle", message: "" };

interface ReviewFormFieldsProps {
  formAction: (formData: FormData) => void;
  state: ActionState<ReviewFormData, ProductReview>;
  fieldErrors: Partial<Record<keyof ReviewFormData | string, string[]>>;
  initialRating: number;
  productId: string;
  review: ProductReview | null | undefined;
  isEdit: boolean;
  onClose: () => void;
}

function ReviewFormFields({
  formAction,
  state,
  fieldErrors: fe,
  initialRating,
  productId,
  review,
  isEdit,
  onClose,
}: ReviewFormFieldsProps) {
  const t = useTranslations("SingleProduct");
  const [rating, setRating] = useState(initialRating);
  const productValue = review?.product ?? productId;

  return (
    <form action={formAction} className="flex flex-col gap-4 pt-2">
      <input type="hidden" name="product" value={productValue} />
      <input type="hidden" name="rating" value={rating} />

      <RatingStars value={rating} onChange={setRating} label={t("ratingLabel")} />
      {fe.rating?.[0] && (
        <p className="font-chillax text-xs text-red-600">{t(fe.rating[0] as never)}</p>
      )}
      {fe.product?.[0] && (
        <p className="font-chillax text-xs text-red-600">{t(fe.product[0] as never)}</p>
      )}

      <Input
        label={t("reviewTitleLabel")}
        name="title"
        placeholder={t("reviewTitlePlaceholder")}
        defaultValue={state.inputs?.title ?? review?.title ?? ""}
        error={fe.title?.[0] ? t(fe.title[0] as never) : undefined}
      />

      <Textarea
        label={t("reviewBodyLabel")}
        name="body"
        placeholder={t("reviewBodyPlaceholder")}
        rows={5}
        defaultValue={state.inputs?.body ?? review?.body ?? ""}
        error={fe.body?.[0] ? t(fe.body[0] as never) : undefined}
        className="min-h-[120px]"
      />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton
          pendingText={t("savingReview")}
          className="font-chillax rounded-[10px] bg-primary px-6 py-2.5 text-sm text-white hover:bg-primary/90"
        >
          {isEdit ? t("saveReview") : t("submitReview")}
        </SubmitButton>
        <button
          type="button"
          onClick={onClose}
          className="font-chillax text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t("cancelReview")}
        </button>
      </div>
    </form>
  );
}

function RatingStars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-chillax text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex size-11 items-center justify-center rounded text-amber-400 transition hover:scale-110 focus:ring-2 focus:ring-primary/30 focus:outline-none"
            aria-label={`${n}`}
          >
            <Star
              className={`h-8 w-8 ${n <= value ? "fill-current" : "fill-transparent"}`}
              strokeWidth={1.25}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewFormDialog({ open, onClose, onSuccess, mode, productId, review }: ReviewFormDialogProps) {
  const t = useTranslations("SingleProduct");
  const isEdit = mode === "edit" && !!review;

  const boundUpdate = isEdit && review ? updateReviewAction.bind(null, review.id) : null;

  const [state, formAction] = useActionState(boundUpdate ?? createReviewAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onSuccess();
      onClose();
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message
      );
    }
  }, [state.status, state.message, onSuccess, onClose]);

  const fe = state.fieldErrors ?? {};
  const formMountKey = `${open}-${mode}-${review?.id ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader className="pt-6">
          <DialogTitle className="font-chillax text-lg font-semibold text-foreground">
            {isEdit ? t("editReview") : t("writeReview")}
          </DialogTitle>
        </DialogHeader>

        <ReviewFormFields
          key={formMountKey}
          formAction={formAction}
          state={state}
          fieldErrors={fe}
          initialRating={review?.rating ?? 5}
          productId={productId}
          review={review}
          isEdit={isEdit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

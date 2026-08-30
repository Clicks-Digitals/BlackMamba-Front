"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { addToWishlistAction, removeFromWishlistAction } from "@/features/wishlist/actions/mutations";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const inWishlist = useWishlistStore((s) => s.ids.includes(productId));
  const addId = useWishlistStore((s) => s.add);
  const removeId = useWishlistStore((s) => s.remove);

  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const isActive = optimistic ?? inWishlist;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !isActive;
    setOptimistic(next);
    if (next) addId(productId);
    else removeId(productId);

    startTransition(async () => {
      const res = next
        ? await addToWishlistAction(productId)
        : await removeFromWishlistAction(productId);

      if (!res.ok) {
        setOptimistic(!next);
        if (next) removeId(productId);
        else addId(productId);
        toast.error(res.message);
      } else {
        toast.success(res.message);
        setOptimistic(null);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-white/10 bg-black/50 p-2 text-[#EDEFF0] shadow-none transition-colors hover:border-[#9e1d20]/50 hover:bg-[#9e1d20] hover:text-white disabled:opacity-50",
        className
      )}
    >
      <Heart
        size={18}
        strokeWidth={1.5}
        className={cn(
          "pointer-events-none transition-colors",
          isActive ? "fill-[#d12f27] text-[#d12f27]" : ""
        )}
      />
    </button>
  );
}

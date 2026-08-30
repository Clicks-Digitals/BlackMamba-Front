"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistStoreInitializer({ ids }: { ids: string[] }) {
  useEffect(() => {
    useWishlistStore.getState().setWishlistIds(ids);
  }, [ids]);

  return null;
}

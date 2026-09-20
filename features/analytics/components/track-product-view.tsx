"use client";

import { useEffect } from "react";
import type { Product } from "@/types";
import { productPayload } from "../lib/map-cart";
import { trackViewItem } from "../lib/track";

/**
 * Renders nothing; reports a product view from a server-rendered page.
 *
 * Drop it into a product page so `view_item` / `ViewContent` fire without
 * turning the page itself into a client component.
 */
export function TrackProductView({ product }: { product: Product }) {
  useEffect(() => {
    trackViewItem(productPayload(product));
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviewsSection } from "./reviews/product-reviews-section";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  overviewContent: ReactNode;
  hasOverview: boolean;
  productId: string;
  avgRating?: number | null;
  reviewCount?: number;
  locale: string;
};

export function ProductTabs({ overviewContent, hasOverview, productId, avgRating, reviewCount, locale }: Props) {
  const rtl = locale === "ar";
  const t = useTranslations("SingleProduct");

  return (
    <div className="border-t border-white/8 bg-[#0d0e0e]">
      <Tabs defaultValue={hasOverview ? "overview" : "reviews"} dir={rtl ? "rtl" : "ltr"}>
        <div className="layout-page layout-gutter-x">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
            {hasOverview && (
              <TabsTrigger
                value="overview"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-5 py-3.5 font-chillax text-[13px] font-semibold tracking-wide",
                  "text-white/45 hover:bg-white/4 hover:text-white",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
                )}
              >
                {t("overviewTab")}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="reviews"
              className={cn(
                "rounded-none border-b-2 border-transparent px-5 py-3.5 font-chillax text-[13px] font-semibold tracking-wide",
                "text-white/45 hover:bg-white/4 hover:text-white",
                "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
              )}
            >
              {t("reviewsTab")}
            </TabsTrigger>
          </TabsList>
        </div>

        {hasOverview && (
          <TabsContent value="overview" className="mt-0">
            {overviewContent}
          </TabsContent>
        )}
        <TabsContent value="reviews" className="mt-0">
          <ProductReviewsSection productId={productId} avgRating={avgRating} reviewCount={reviewCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

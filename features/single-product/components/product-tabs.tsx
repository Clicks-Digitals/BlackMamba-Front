"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviewsSection } from "./reviews/product-reviews-section";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  overviewContent: ReactNode;
  specsContent?: ReactNode;
  hasOverview: boolean;
  hasSpecs?: boolean;
  productId: string;
  avgRating?: number | null;
  reviewCount?: number;
  locale: string;
};

export function ProductTabs({
  overviewContent,
  specsContent,
  hasOverview,
  hasSpecs,
  productId,
  avgRating,
  reviewCount,
  locale,
}: Props) {
  const rtl = locale === "ar";
  const t = useTranslations("SingleProduct");
  const defaultTab = hasOverview ? "overview" : hasSpecs ? "specs" : "reviews";

  const triggerCls = cn(
    "rounded-none border-b-2 border-transparent px-5 py-3.5 font-chillax text-[13px] font-semibold tracking-wide",
    "text-muted-foreground hover:bg-white/4 hover:text-foreground",
    "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
  );

  return (
    <div className="border-t border-border bg-background">
      <Tabs defaultValue={defaultTab} dir={rtl ? "rtl" : "ltr"}>
        <div className="layout-page layout-gutter-x">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
            {hasOverview && (
              <TabsTrigger value="overview" className={triggerCls}>
                {t("overviewTab")}
              </TabsTrigger>
            )}
            {hasSpecs && (
              <TabsTrigger value="specs" className={triggerCls}>
                {t("specifications")}
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews" className={triggerCls}>
              {t("reviewsTab")}
            </TabsTrigger>
          </TabsList>
        </div>

        {hasOverview && (
          <TabsContent value="overview" className="mt-0">
            {overviewContent}
          </TabsContent>
        )}
        {hasSpecs && (
          <TabsContent value="specs" className="mt-0">
            {specsContent}
          </TabsContent>
        )}
        <TabsContent value="reviews" className="mt-0">
          <ProductReviewsSection productId={productId} avgRating={avgRating} reviewCount={reviewCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

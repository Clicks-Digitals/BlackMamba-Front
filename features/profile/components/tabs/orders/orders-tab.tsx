"use client";

import { useState, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { InfiniteScroll } from "@/components/shared";
import { getOrders, OrderCard, OrderDetailDialog } from "@/features/profile";
import type { Order } from "@/types";
import { useTranslations } from "next-intl";

export function OrdersTab() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const t = useTranslations("Profile.OrdersTab");

  const filters = {};

  const refresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[18px] font-semibold text-foreground">
        {t("orderHistory")}
      </h3>

      <InfiniteScroll<Order>
        key={refreshCount}
        fetchAction={getOrders}
        filters={filters}
        emptyState={
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#000000] bg-[#000000] py-16 text-center">
            <ShoppingBag size={48} className="text-white/25" />
            <div>
              <p className="text-[16px] font-medium text-[#FFFFFF]">
                {t("noRecentOrders")}
              </p>
              <p className="text-[13px] text-white/45">
                {t("noOrdersDesc")}
              </p>
            </div>
          </div>
        }
        endMessage={t("allOrdersLoaded")}
      >
        {(orders) => (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={setSelectedOrder}
                onRefresh={refresh}
              />
            ))}
          </div>
        )}
      </InfiniteScroll>

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

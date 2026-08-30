"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Cart } from "@/features/cart/types";
import type { CouponData } from "@/features/cart/actions/mutations";
import { validateCouponAction } from "@/features/cart/actions/mutations";
import type { Address } from "@/types";
import type { ShippingOption } from "@/features/checkout/types";
import { placeOrderAction } from "@/features/checkout/actions/checkout";
import { AddressSection } from "@/features/checkout/components/sections/address-section";
import { ShippingMethodSection } from "@/features/checkout/components/sections/shipping-method-section";
import { PaymentMethodSection } from "@/features/checkout/components/sections/payment-method-section";
import { OrderSummary } from "@/features/checkout/components/sections/order-summary";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CheckoutDetailsProps {
  cart: Cart | null;
  addresses: Address[];
  isLoggedIn: boolean;
  shippingOptions: ShippingOption[];
}

export default function CheckoutDetails({
  cart,
  addresses,
  isLoggedIn,
  shippingOptions
}: CheckoutDetailsProps) {
  const router = useRouter();
  const t = useTranslations("Checkout.emptyCart");
  const tDetails = useTranslations("Checkout.details");
  const tToast = useTranslations("Checkout.toast");
  const tShip = useTranslations("Checkout.shipping");

  const currencySuffix = useMemo(() => {
    const sym = cart?.items[0]?.product_details?.currency_info?.symbol;
    return sym && sym.trim() !== "" ? sym : tShip("currencySuffix");
  }, [cart?.items, tShip]);

  const [state, action] = useActionState(placeOrderAction, {
    status: "idle",
    message: ""
  });
  const fe = state.fieldErrors || {};

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null
  );
  const [selectedShippingId, setSelectedShippingId] = useState<string>(shippingOptions[0]?.id ?? "");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  useEffect(() => {
    if (state.status === "success" && state.data?.orderId) {
      toast.success(tToast("orderPlaced"));
      router.push(`/order-success?order_id=${state.data.orderId}`);
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.status, state.message, state.data, router, tToast]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const totalAmount = cart?.total_amount ?? "0";
    const cartItems = cart?.items
      .filter((item) => !!item.product)
      .map((item) => ({ product_id: item.product!, item_subtotal: item.total_price })) ?? [];
    const res = await validateCouponAction(couponInput.trim(), totalAmount, cartItems);
    if (res.status === "success" && res.data) {
      setAppliedCoupon(res.data);
      toast.success(tToast("couponApplied", { amount: res.data.discountAmount }));
    } else {
      toast.error(res.message ?? tToast("invalidCoupon"));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const totalAmount = cart?.total_amount ?? "0";
  const subtotalNum = parseFloat(totalAmount) || 0;
  const discountAmount = parseFloat(appliedCoupon?.discountAmount ?? "0") || 0;
  const selectedShipping = shippingOptions.find((s) => s.id === selectedShippingId);
  const shippingPrice = parseFloat(selectedShipping?.price ?? "0") || 0;
  const finalTotal = (subtotalNum - discountAmount + shippingPrice).toFixed(2);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-background py-20">
        <div className="layout-page layout-gutter-x space-y-6 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{t("title")}</h1>
          <p className="text-base text-muted-foreground">{t("description")}</p>
          <Button asChild size="lg" className="rounded-md bg-primary">
            <Link href="/products">{t("continueShopping")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="layout-page layout-gutter-x py-6 md:py-10">
        <div className="mb-8 md:mb-12">
          <p className="bm-kicker mb-2">{tDetails("subtitle")}</p>
          <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-none text-foreground">{tDetails("title")}</h1>
        </div>

        <form action={action} noValidate>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-6 lg:col-span-2 md:space-y-8">
              <input type="hidden" name="address_id" value={selectedAddressId ?? ""} />
              <input type="hidden" name="shipping_option_id" value={selectedShippingId} />
              <input type="hidden" name="coupon_code" value={appliedCoupon?.code ?? ""} />
              <input type="hidden" name="payment_method" value="CASH_ON_DELIVERY" />
              <input type="hidden" name="is_logged_in" value={isLoggedIn ? "true" : "false"} />

              <AddressSection
                isLoggedIn={isLoggedIn}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onAddressChange={setSelectedAddressId}
                fieldErrors={fe}
                defaultValues={state.inputs}
                stepNumber={1}
              />

              <ShippingMethodSection
                shippingOptions={shippingOptions}
                selectedShippingId={selectedShippingId}
                onShippingChange={setSelectedShippingId}
                stepNumber={2}
                currencySuffix={currencySuffix}
              />

              <PaymentMethodSection stepNumber={3} />

              <div className="lg:hidden">
                <OrderSummary
                  cart={cart}
                  totalAmount={totalAmount}
                  discountAmount={discountAmount}
                  finalTotal={finalTotal}
                  appliedCoupon={appliedCoupon}
                  couponInput={couponInput}
                  onCouponInputChange={setCouponInput}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  selectedShipping={selectedShipping}
                  currencySuffix={currencySuffix}
                />
              </div>
            </div>

            <div className="hidden lg:block lg:sticky lg:top-[calc(var(--layout-chrome-top)+1rem)]">
              <OrderSummary
                cart={cart}
                totalAmount={totalAmount}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                appliedCoupon={appliedCoupon}
                couponInput={couponInput}
                onCouponInputChange={setCouponInput}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                selectedShipping={selectedShipping}
                currencySuffix={currencySuffix}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

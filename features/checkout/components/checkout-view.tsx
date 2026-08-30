import type { CheckoutClientProps } from "@/features/checkout/types";
import CheckoutDetails from "./sections/checkout-details";

export function CheckoutView({ cart, addresses, isLoggedIn, shippingOptions }: CheckoutClientProps) {
  return (
    <div>
      <section>
      </section>
      <section>
        <CheckoutDetails
          cart={cart}
          addresses={addresses}
          isLoggedIn={isLoggedIn}
          shippingOptions={shippingOptions}
        />
      </section>
    </div>
  );
}

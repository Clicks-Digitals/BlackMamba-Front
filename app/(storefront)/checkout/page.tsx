import { cookies } from "next/headers";
import { getMyCart } from "@/features/cart";
import { getAddresses, getProfileAction } from "@/features/profile";
import { getShippingOptions, CheckoutView } from "@/features/checkout";

/**
 * S2: checkout used to redirect anyone without an account to sign-in.
 *
 * The guest path already existed on both sides — the order API accepts a
 * guest email and a cart token, and the address section has a full guest
 * form behind `isLoggedIn`. Only this redirect stood in front of it, so
 * every shopper had to make an account to pay cash on delivery.
 */
export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const hasToken = !!cookieStore.get("token")?.value;

  // A signed-in shopper gets their saved addresses; a guest fills the form.
  // Fetching the profile without a token would just 401, so skip it.
  const [cart, shippingOptions, profile] = await Promise.all([
    getMyCart(),
    getShippingOptions(),
    hasToken ? getProfileAction() : Promise.resolve({ user: null }),
  ]);

  const isLoggedIn = !!profile.user;
  const addresses = isLoggedIn ? ((await getAddresses()) ?? []) : [];

  return (
    <CheckoutView
      cart={cart}
      addresses={addresses}
      isLoggedIn={isLoggedIn}
      shippingOptions={shippingOptions}
    />
  );
}

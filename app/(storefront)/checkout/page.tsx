import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyCart } from "@/features/cart";
import { getAddresses, getProfileAction } from "@/features/profile";
import { getShippingOptions, CheckoutView } from "@/features/checkout";

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const hasToken = !!cookieStore.get("token")?.value;

  if (!hasToken) {
    redirect("/login?callback=/checkout");
  }

  const [cart, profile, shippingOptions] = await Promise.all([
    getMyCart(),
    getProfileAction(),
    getShippingOptions()
  ]);

  const isLoggedIn = !!profile.user;
  if (!isLoggedIn) {
    redirect("/login?callback=/checkout");
  }

  const addresses = await getAddresses() ?? [];

  return (
    <CheckoutView
      cart={cart}
      addresses={addresses}
      isLoggedIn={isLoggedIn}
      shippingOptions={shippingOptions}
    />
  );
}

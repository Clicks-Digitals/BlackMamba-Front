import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { TrackOrderView } from "@/features/track-order/track-order-view";

export async function generateMetadata(): Promise<Metadata> {
  const rtl = (await getLocale()) === "ar";
  return {
    title: rtl ? "تتبع طلبك" : "Track your order",
    description: rtl
      ? "ابحث عن طلبك برقم الطلب والبريد الإلكتروني."
      : "Find your order with its number and the email you used.",
    alternates: { canonical: "/track-order" },
  };
}

export default async function Page() {
  const rtl = (await getLocale()) === "ar";
  return <TrackOrderView rtl={rtl} />;
}

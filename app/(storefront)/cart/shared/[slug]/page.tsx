import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getSharedCart } from "@/features/cart/actions/share";
import { SharedCartView } from "@/features/cart/components/shared-cart-view";

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === "ar";
  return { title: ar ? "سلة مشتركة" : "Shared cart", robots: { index: false } };
}

interface SharedCartPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharedCartPage({ params }: SharedCartPageProps) {
  const { slug } = await params;
  const shared = await getSharedCart(slug);
  if (!shared) notFound();
  return <SharedCartView shared={shared} />;
}

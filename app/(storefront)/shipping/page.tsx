import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { shippingContent } from "@/features/legal/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "التوصيل" : "Delivery",
    description: rtl ? "إلى أين نوصل، وكم تستغرق المدة، وكم التكلفة." : "Where we deliver, how long it takes and what it costs.",
    alternates: { canonical: "/shipping" },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = shippingContent(rtl);

  return (
    <LegalPage
      kicker={kicker}
      title={title}
      updated={updated}
      intro={intro}
      sections={sections}
      rtl={rtl}
    />
  );
}

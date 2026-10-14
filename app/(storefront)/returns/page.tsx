import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { returnsContent } from "@/features/legal/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "الإرجاع والاستبدال" : "Returns & Exchanges",
    description: rtl ? "كيف ترجع أو تستبدل ما اشتريته." : "How to return or exchange something you bought.",
    alternates: { canonical: "/returns" },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = returnsContent(rtl);

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

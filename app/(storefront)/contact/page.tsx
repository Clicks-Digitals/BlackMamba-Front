import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { contactContent } from "@/features/legal/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "تواصل معنا" : "Contact us",
    description: rtl ? "كيف تتواصل معنا بخصوص طلب أو استفسار." : "How to reach us about an order or a question.",
    alternates: { canonical: "/contact" },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = contactContent(rtl);

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

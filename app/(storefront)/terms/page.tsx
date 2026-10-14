import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { termsContent } from "@/features/legal/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "الشروط والأحكام" : "Terms & Conditions",
    description: rtl ? "الشروط التي توافق عليها عند الطلب منّا." : "The terms you agree to when you order from us.",
    alternates: { canonical: "/terms" },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = termsContent(rtl);

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

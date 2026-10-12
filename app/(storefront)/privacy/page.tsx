import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { privacyContent } from "@/features/legal/data/privacy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "سياسة الخصوصية" : "Privacy Policy",
    description: rtl
      ? "ما الذي نجمعه من معلومات شخصية، وكيف نستخدمها، وكيف تطلب حذفها."
      : "What personal information we collect, how we use it, and how to ask us to delete it.",
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = privacyContent(rtl);

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

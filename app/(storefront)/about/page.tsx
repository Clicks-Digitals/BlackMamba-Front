import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal/components/legal-page";
import { aboutContent } from "@/features/legal/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const rtl = locale === "ar";
  return {
    title: rtl ? "عن المتجر" : "About us",
    description: rtl ? "من نحن وماذا نبيع." : "Who we are and what we sell.",
    alternates: { canonical: "/about" },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const rtl = locale === "ar";
  const { kicker, title, updated, intro, sections } = aboutContent(rtl);

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

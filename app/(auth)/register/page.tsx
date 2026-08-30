import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterView } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.Register");
  return { title: t("title") };
}

export default function RegisterPage() {
  return <RegisterView />;
}

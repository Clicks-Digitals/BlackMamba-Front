import { getLocale, getTranslations } from "next-intl/server";
import { CategoriesFeature } from "@/features/categories";

export default async function CategoriesPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Home")]);

  return (
    <CategoriesFeature
      locale={locale}
      pageTitle={t("categoriesTitle")}
      exploreLabel={t("exploreCollection")}
      emptyMessage={t("categoriesEmpty")}
      endOfListMessage={t("categoriesEndOfList")}
    />
  );
}

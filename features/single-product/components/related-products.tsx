import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard, ScrollTopLink } from "@/components/shared";
import { SectionHeading } from "@/components/motion";
import { getRelatedProducts } from "@/features/single-product";

interface RelatedProductsProps {
  slug: string;
}

export async function RelatedProducts({ slug }: RelatedProductsProps) {
  const [res, locale, t] = await Promise.all([
    getRelatedProducts(slug),
    getLocale(),
    getTranslations("SingleProduct"),
  ]);
  if (!res.ok || !res.data?.length) return null;

  return (
    <section className="layout-page layout-gutter-x my-12 md:my-16">
      <SectionHeading
        kicker={t("relatedKicker")}
        title={t("youMayAlsoLike")}
        rtl={locale === "ar"}
        action={
          <ScrollTopLink
            href="/products"
            className="rounded-md border border-white/12 px-4 py-1.5 font-chillax text-sm font-semibold text-white/70 transition-colors duration-200 hover:border-primary/40 hover:text-white"
          >
            {t("viewMore")}
          </ScrollTopLink>
        }
      />
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {res.data.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}

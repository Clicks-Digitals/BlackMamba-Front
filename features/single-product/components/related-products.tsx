import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard, ScrollTopLink } from "@/components/shared";
import { SectionHeading } from "@/components/motion";
import { getRelatedProducts } from "@/features/single-product";
import { getMyCart } from "@/features/cart/actions/queries";
import { purchasableRecommendations } from "@/features/cart/lib/recommendations";

interface RelatedProductsProps {
  slug: string;
}

export async function RelatedProducts({ slug }: RelatedProductsProps) {
  const [res, cart, locale, t] = await Promise.all([
    getRelatedProducts(slug),
    getMyCart().catch(() => null),
    getLocale(),
    getTranslations("SingleProduct"),
  ]);
  if (!res.ok) return null;
  const products = purchasableRecommendations(res.data ?? [], {
    cartItems: cart?.items ?? [],
    excludeSlug: slug,
  });
  if (!products.length) return null;

  return (
    <section className="layout-page layout-gutter-x my-8 md:my-10">
      <SectionHeading
        title={t("youMayAlsoLike")}
        rtl={locale === "ar"}
        action={
          <ScrollTopLink
            href="/products"
            className="store-view-all"
          >
            {t("viewMore")}
          </ScrollTopLink>
        }
      />
      <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}

/**
 * Where a product lives.
 *
 * Canonical form puts the category trail in the path:
 *   /peripheral-accessories/memory-cards/sandisk-extreme-microsdxc-512gb
 *
 * A product with no category has no trail to use, so it keeps the flat
 * /products/<slug> form. Both are served; the flat one redirects to the
 * canonical path when a trail exists.
 */

/** Route segments that must never be mistaken for a category. */
export const RESERVED_SEGMENTS = new Set([
  "api",
  "brand",
  "cart",
  "categories",
  "checkout",
  "favourites",
  "forgot-password",
  "login",
  "order-success",
  "pc-builder",
  "about",
  "contact",
  "privacy",
  "returns",
  "shipping",
  "terms",
  "products",
  "profile",
  "register",
  "service-center",
  "wishlist",
  "_next",
]);

type TrailItem = { slug: string };

type ProductLike = {
  slug: string;
  category_path?: TrailItem[] | null;
};

/** The canonical path for a product. */
export function productHref(product: ProductLike): string {
  const trail = (product.category_path ?? [])
    .map((item) => item?.slug)
    .filter((slug): slug is string => Boolean(slug));
  if (trail.length === 0 || RESERVED_SEGMENTS.has(trail[0])) {
    return `/products/${product.slug}`;
  }
  return `/${trail.join("/")}/${product.slug}`;
}

/** The same path built from parts, for the server route's canonical check. */
export function buildProductHref(
  categoryPath: TrailItem[] | null | undefined,
  slug: string
): string {
  return productHref({ slug, category_path: categoryPath ?? [] });
}

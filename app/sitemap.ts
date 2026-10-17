import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api';
import { productHref } from '@/lib/utils/product-url';
import type { PaginatedResponse } from '@/types';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';

/**
 * The sitemap listed thirteen static pages and nothing else, so none of the
 * catalogue was offered to search engines — the pages that actually bring
 * people to a shop.
 */
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/products', changeFrequency: 'daily', priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/brands', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/pc-builder', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/pc-builder/parts', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/pc-builder/ready-made', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/service-center', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/testimonials', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/track-order', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/shipping', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/returns', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

/** Google's limit is 50,000 URLs per file; stay well inside it. */
const MAX_PRODUCTS = 5000;
const PAGE_SIZE = 200;

async function allProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let page = 1; out.length < MAX_PRODUCTS; page += 1) {
    const res = await apiClient<PaginatedResponse<Product>>(
      `/products/?page=${page}&page_size=${PAGE_SIZE}`,
      { revalidate: 3600 }
    );
    if (!res.ok || !res.data?.results?.length) break;
    out.push(...res.data.results);
    if (!res.data.next) break;
  }
  return out.slice(0, MAX_PRODUCTS);
}

async function allCategories(): Promise<Category[]> {
  const res = await apiClient<PaginatedResponse<Category>>(
    '/categories/?page_size=500',
    { revalidate: 3600 }
  );
  return res.ok && res.data ? (res.data.results ?? []) : [];
}

async function allBrands(): Promise<{ slug: string }[]> {
  const res = await apiClient<PaginatedResponse<{ slug: string }>>(
    '/categories/brands/?page_size=500',
    { revalidate: 3600 }
  );
  return res.ok && res.data ? (res.data.results ?? []) : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const lastModified = new Date();

  // One slow source must not empty the whole sitemap.
  const [products, categories, brands] = await Promise.all([
    allProducts().catch(() => []),
    allCategories().catch(() => []),
    allBrands().catch(() => []),
  ]);

  const staticEntries = ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/products?category_slug=${encodeURIComponent(category.slug)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const brandEntries = brands
    .filter((brand) => brand.slug)
    .map((brand) => ({
      url: `${baseUrl}/brand/${encodeURIComponent(brand.slug)}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  const productEntries = products.map((product) => ({
    url: `${baseUrl}${productHref(product)}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries];
}

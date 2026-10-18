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

/**
 * Google's limit is 50,000 URLs per file. The catalogue is around 1,300
 * products today, so this leaves plenty of room for the static pages,
 * categories and brands on top.
 */
const MAX_PRODUCTS = 45000;
/** The API's ceiling for page_size (apps.core.pagination). */
const PAGE_SIZE = 500;

/**
 * Walk every page of a list endpoint. The API puts the next page under
 * `links.next`, not `next`, so checking `next` alone stopped after page 1
 * and the sitemap only ever listed the first 200 products.
 */
async function allPages<T>(path: string, limit = Number.POSITIVE_INFINITY): Promise<T[]> {
  const out: T[] = [];
  const sep = path.includes('?') ? '&' : '?';
  for (let page = 1; out.length < limit; page += 1) {
    const res = await apiClient<PaginatedResponse<T>>(
      `${path}${sep}page=${page}&page_size=${PAGE_SIZE}`,
      { revalidate: 3600 }
    );
    if (!res.ok || !res.data?.results?.length) break;
    out.push(...res.data.results);
    const next = res.data.next ?? res.data.links?.next ?? null;
    const totalPages = res.data.total_pages;
    if (!next && !(totalPages && page < totalPages)) break;
  }
  return Number.isFinite(limit) ? out.slice(0, limit) : out;
}

function allProducts(): Promise<Product[]> {
  return allPages<Product>('/products/', MAX_PRODUCTS);
}

function allCategories(): Promise<Category[]> {
  return allPages<Category>('/categories/');
}

function allBrands(): Promise<{ slug: string }[]> {
  return allPages<{ slug: string }>('/categories/brands/');
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

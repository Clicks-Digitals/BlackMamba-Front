import { MetadataRoute } from 'next';

/** Static routes. Product and category URLs are not listed yet. */
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/products', changeFrequency: 'daily', priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/pc-builder', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/pc-builder/parts', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/pc-builder/ready-made', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/service-center', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const lastModified = new Date();

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}

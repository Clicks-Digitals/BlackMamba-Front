import type { Product } from "@/types/product";
import { DEMO_PRODUCT_TABLE } from "./demo-specs-table";

export const DEMO_PRODUCT_SLUG = "demo-overview";

const GALLERY = [
  "/images/demo/gallery-1.jpg",
  "/images/demo/gallery-2.jpg",
  "/images/demo/gallery-3.jpg",
  "/images/demo/gallery-4.jpg",
  "/images/demo/gallery-5.jpg",
  "/images/demo/gallery-6.jpg",
];

export const DEMO_PRODUCT: Product = {
  id: "demo-overview",
  name: 'Black Mamba BM-27FHD 200Hz 27" IPS Gaming Monitor',
  name_ar: "شاشة بلاك مامبا BM-27FHD 200Hz مقاس 27 إنش IPS للألعاب",
  slug: DEMO_PRODUCT_SLUG,
  sku: "BM-27FHD-200",
  avg_rating: 4.6,
  review_count: 12,
  thumbnail: GALLERY[0],
  description:
    "A 27-inch IPS gaming monitor with 200Hz refresh, 1ms MPRT response, and Adaptive Sync. This demo listing shows the Product Overview long-image section.",
  description_ar:
    "شاشة ألعاب IPS مقاس 27 إنش بمعدل تحديث 200Hz وزمن استجابة 1ms وتقنية Adaptive Sync. هذا منتج تجريبي لعرض قسم الصورة الطويلة.",
  overview: null,
  overview_ar: null,
  overview_image: "/images/demo/product-overview.svg",
  overview_image_url: "/images/demo/product-overview.svg",
  overview_image_ar: null,
  features: [
    "1ms MPRT Response Time: Lightning-fast pixel transitions to keep motion sharp in competitive games.",
    "200Hz Refresh Rate: High refresh for smoother tracking and less motion smear.",
    "FHD Resolution: 1920 × 1080 on a 27-inch IPS panel for everyday play and work.",
    "27\" Flat IPS Panel: Wide viewing angles and consistent color across the screen.",
    "Adaptive Sync Technology: Reduces tearing and stutter with a compatible graphics card.",
  ],
  features_ar: [
    "زمن استجابة 1ms MPRT: انتقالات بكسل سريعة للحفاظ على وضوح الحركة.",
    "معدل تحديث 200Hz: تتبع أكثر سلاسة وضبابية حركة أقل.",
    "دقة FHD: 1920 × 1080 على لوحة IPS مقاس 27 إنش.",
    "لوحة IPS مسطحة 27 إنش: زوايا رؤية واسعة وألوان ثابتة.",
    "تقنية Adaptive Sync: تقلل التمزق والتقطع مع كرت شاشة متوافق.",
  ],
  base_price: "149.00",
  discount_price: "129.00",
  has_discount: true,
  is_available: true,
  best_seller: true,
  clearance_sale: false,
  clearance_sale_start: null,
  clearance_sale_end: null,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
  categories: [{ id: "demo-monitors", name: "Monitors", name_ar: "شاشات", slug: "monitors" }],
  brand: {
    id: "black-mamba",
    name: "Black Mamba",
    name_ar: "بلاك مامبا",
    slug: "black-mamba",
    logo_url: "/images/brand/mark-red.png",
    website: null,
  },
  gallery: GALLERY.map((file, index) => ({
    id: `demo-gallery-${index}`,
    product: "demo-overview",
    file,
    alt_text: null,
    display_order: index,
    is_primary: index === 0,
    file_type: "IMAGE" as const,
  })),
  inventory_mode: "TRACK",
  product_stock: 18,
  in_stock: true,
  currency_info: { code: "JOD", symbol: "JD" },
  available_variations: [],
  available_combinations: [],
  table: DEMO_PRODUCT_TABLE,
  variant_group: null,
  variant_label: "",
  variants: [],
  campaign_price: null,
  active_campaign: null,
};

export function demoMatchesQuery(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    DEMO_PRODUCT.name,
    DEMO_PRODUCT.name_ar,
    DEMO_PRODUCT.slug,
    "demo",
    "monitor",
    "mamba",
    "bm-27",
    "gaming",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q) || q.split(/\s+/).some((part) => hay.includes(part));
}

export function demoMatchesFilters(filters: Record<string, string> = {}): boolean {
  if (filters.clearance_sale === "true") return false;
  const brand = (filters.brand_slug ?? "").toLowerCase();
  if (brand && !brand.split(",").includes("black-mamba")) return false;
  const category = (filters.category_slug ?? "").toLowerCase();
  if (category && !category.split(",").some((s) => ["monitors", "monitor"].includes(s))) return false;
  if (filters.search && !demoMatchesQuery(filters.search)) return false;
  return true;
}

export function prependDemoProduct(products: Product[], filters?: Record<string, string>): Product[] {
  if (filters && !demoMatchesFilters(filters)) {
    return products.filter((p) => p.id !== DEMO_PRODUCT.id);
  }
  const rest = products.filter((p) => p.id !== DEMO_PRODUCT.id && p.slug !== DEMO_PRODUCT.slug);
  return [DEMO_PRODUCT, ...rest];
}

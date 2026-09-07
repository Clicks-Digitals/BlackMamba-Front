export type ShowcaseBrand = {
  name: string;
  slug: string;
  logo: string;
  website: string;
};

/** Brands shown on the home rail and used when the brand-detail API is unavailable. */
export const SHOWCASE_BRANDS: ShowcaseBrand[] = [
  { name: "AMD", slug: "amd", logo: "/brands/amd.svg", website: "https://www.amd.com" },
  { name: "Intel", slug: "intel", logo: "/brands/intel.svg", website: "https://www.intel.com" },
  { name: "NVIDIA", slug: "nvidia", logo: "/brands/nvidia.svg", website: "https://www.nvidia.com" },
  { name: "ASUS", slug: "asus", logo: "/brands/asus.svg", website: "https://www.asus.com" },
  { name: "MSI", slug: "msi", logo: "/brands/msi.svg", website: "https://www.msi.com" },
  { name: "Corsair", slug: "corsair", logo: "/brands/corsair.svg", website: "https://www.corsair.com" },
  { name: "Logitech", slug: "logitech", logo: "/brands/logitech.svg", website: "https://www.logitech.com" },
  { name: "Samsung", slug: "samsung", logo: "/brands/samsung.svg", website: "https://www.samsung.com" },
  { name: "Kingston", slug: "kingston", logo: "/brands/kingston.svg", website: "https://www.kingston.com" },
  { name: "Razer", slug: "razer", logo: "/brands/razer.svg", website: "https://www.razer.com" },
  { name: "Cooler Master", slug: "cooler-master", logo: "/brands/coolermaster.svg", website: "https://www.coolermaster.com" },
];

export function findShowcaseBrand(slug: string): ShowcaseBrand | undefined {
  const key = slug.trim().toLowerCase();
  return SHOWCASE_BRANDS.find((b) => b.slug === key);
}

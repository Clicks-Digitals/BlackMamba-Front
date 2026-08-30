export type PCSlot =
  | "CPU"
  | "CPU_COOLER"
  | "MOTHERBOARD"
  | "RAM"
  | "GPU"
  | "STORAGE"
  | "PSU"
  | "CASE"
  | "OS";

export const SLOT_ORDER: PCSlot[] = [
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "CPU_COOLER",
  "PSU",
  "CASE",
  "STORAGE",
  "OS"
];

export const SLOT_LABELS: Record<PCSlot, string> = {
  CPU: "CPU",
  CPU_COOLER: "CPU Cooler",
  MOTHERBOARD: "Motherboard",
  RAM: "Memory (RAM)",
  GPU: "Graphics Card",
  STORAGE: "Storage",
  PSU: "Power Supply",
  CASE: "Case",
  OS: "Operating System"
};

export interface PCPartSpec {
  slot: PCSlot;
  socket: string | null;
  tdp_watts: number | null;
  memory_type: string | null;
  form_factor: "ITX" | "MATX" | "ATX" | null;
  max_form_factor: "ITX" | "MATX" | "ATX" | null;
  rated_tdp_watts: number | null;
  power_draw_watts: number | null;
  wattage: number | null;
  processor_brand: "INTEL" | "AMD" | null;
  graphics_brand: "NVIDIA" | "AMD" | null;
  color: "BLACK" | "WHITE" | null;
  is_dual_channel_kit: boolean | null;
}

export interface PCPartVariationOption {
  variation_id: string;
  value: string;
  value_ar: string | null;
  sku: string;
  variation_stock: number;
  variation_price: string | null;
  image: string | null;
}

export interface PCPartVariationGroup {
  name: string;
  name_ar: string | null;
  total_variation_stock: number;
  options: PCPartVariationOption[];
}

export interface PCPart {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  description_ar: string | null;
  base_price: string | null;
  discount_price: string | null;
  price: string | null;
  is_available: boolean;
  product_stock: number | null;
  spec: PCPartSpec | null;
  is_compatible: boolean | null;
  available_variations: PCPartVariationGroup[];
}

export interface PCBuildItemData {
  id: string;
  slot: PCSlot;
  product: string;
  variation: string | null;
  product_details: PCPart;
  variation_details: { id: string; sku: string; attribute_names: string[] } | null;
  unit_price: string;
}

export interface CompatibilityIssue {
  id: string;
  code: string;
  severity: "RED" | "YELLOW";
  slot: PCSlot;
  message: string;
  suggested_fix_product_id: string | null;
  suggested_fix_product_name: string | null;
}

export interface NextTier {
  min_parts: number;
  discount_percent: string;
  parts_needed: number;
}

export interface BuildPricing {
  subtotal: string;
  discount_percent: string;
  total_price: string;
  part_count: number;
  next_tier: NextTier | null;
}

export type BrandPreference = "ANY" | "INTEL" | "AMD";
export type GraphicsPreference = "ANY" | "NVIDIA" | "AMD";
export type ColorPreference = "ANY" | "BLACK" | "WHITE";

export interface PartFilters {
  slot?: PCSlot;
  search?: string;
  socket?: string;
  memory_type?: string;
  form_factor?: string;
  max_form_factor?: string;
  processor_brand?: string;
  graphics_brand?: string;
  color?: string;
  wattage_min?: number;
  wattage_max?: number;
  tdp_min?: number;
  tdp_max?: number;
  price_min?: number;
  price_max?: number;
  ordering?: string;
  compatible_with?: string;
}

export interface PCBuild {
  id: string;
  build_token: string | null;
  is_template: boolean;
  tier: string | null;
  name: string;
  name_ar: string;
  target_performance: string;
  thumbnail: string | null;
  display_order: number;
  preference_processor_brand: BrandPreference;
  preference_graphics_brand: GraphicsPreference;
  preference_color: ColorPreference;
  items: PCBuildItemData[];
  total_power_draw_watts: number;
  has_blocking_issues: boolean;
  compatibility: { red_issues: CompatibilityIssue[]; yellow_issues: CompatibilityIssue[] };
  pricing: BuildPricing;
  is_shareable: boolean;
  share_slug: string | null;
}

import { SLOT_ORDER, type PCBuild, type PCBuildItemData, type PCPart, type PCSlot } from "@/features/pc-builder/types";

type DemoPart = {
  slot: PCSlot;
  name: string;
  name_ar: string;
  price: string;
  watts: number;
  spec: Partial<NonNullable<PCPart["spec"]>>;
};

const DEMO_PARTS: DemoPart[] = [
  {
    slot: "CPU",
    name: "AMD Ryzen 7 7800X3D",
    name_ar: "إيه إم دي رايزن 7 7800X3D",
    price: "289.00",
    watts: 120,
    spec: { socket: "AM5", tdp_watts: 120, processor_brand: "AMD" },
  },
  {
    slot: "MOTHERBOARD",
    name: "MSI MAG B650 Tomahawk WiFi",
    name_ar: "إم إس آي MAG B650 توماهوك",
    price: "199.00",
    watts: 40,
    spec: { socket: "AM5", memory_type: "DDR5", form_factor: "ATX" },
  },
  {
    slot: "RAM",
    name: "G.Skill Trident Z5 32GB DDR5-6000",
    name_ar: "جي.سكيل ترايدنت Z5 32 جيجا",
    price: "119.00",
    watts: 10,
    spec: { memory_type: "DDR5", is_dual_channel_kit: true },
  },
  {
    slot: "GPU",
    name: "NVIDIA GeForce RTX 4070 SUPER 12GB",
    name_ar: "إنفيديا RTX 4070 SUPER",
    price: "549.00",
    watts: 220,
    spec: { graphics_brand: "NVIDIA", power_draw_watts: 220 },
  },
  {
    slot: "CPU_COOLER",
    name: "Thermalright Peerless Assassin 120 SE",
    name_ar: "ثيرمال رايت بيرلس أساسن",
    price: "39.00",
    watts: 8,
    spec: { rated_tdp_watts: 260, color: "BLACK" },
  },
  {
    slot: "PSU",
    name: "Corsair RM850x 850W Gold",
    name_ar: "كورسير RM850x 850 واط",
    price: "129.00",
    watts: 0,
    spec: { wattage: 850 },
  },
  {
    slot: "CASE",
    name: "Lian Li LANCOOL 216 Black",
    name_ar: "ليان لي لانكول 216 أسود",
    price: "89.00",
    watts: 5,
    spec: { max_form_factor: "ATX", color: "BLACK" },
  },
  {
    slot: "STORAGE",
    name: "Samsung 990 Pro 2TB NVMe",
    name_ar: "سامسونج 990 برو 2 تيرا",
    price: "159.00",
    watts: 8,
    spec: {},
  },
  {
    slot: "OS",
    name: "Windows 11 Pro",
    name_ar: "ويندوز 11 برو",
    price: "99.00",
    watts: 0,
    spec: {},
  },
];

function toItem(part: DemoPart, index: number): PCBuildItemData {
  const product: PCPart = {
    id: `demo-${part.slot.toLowerCase()}`,
    name: part.name,
    name_ar: part.name_ar,
    slug: `demo-${part.slot.toLowerCase()}`,
    thumbnail: null,
    description: null,
    description_ar: null,
    base_price: part.price,
    discount_price: null,
    price: part.price,
    is_available: true,
    product_stock: 8,
    spec: {
      slot: part.slot,
      socket: part.spec.socket ?? null,
      tdp_watts: part.spec.tdp_watts ?? null,
      memory_type: part.spec.memory_type ?? null,
      form_factor: part.spec.form_factor ?? null,
      max_form_factor: part.spec.max_form_factor ?? null,
      rated_tdp_watts: part.spec.rated_tdp_watts ?? null,
      power_draw_watts: part.spec.power_draw_watts ?? null,
      wattage: part.spec.wattage ?? null,
      processor_brand: part.spec.processor_brand ?? null,
      graphics_brand: part.spec.graphics_brand ?? null,
      color: part.spec.color ?? null,
      is_dual_channel_kit: part.spec.is_dual_channel_kit ?? null,
    },
    is_compatible: true,
    available_variations: [],
  };

  return {
    id: `demo-item-${index + 1}`,
    slot: part.slot,
    product: product.id,
    variation: null,
    product_details: product,
    variation_details: null,
    unit_price: part.price,
  };
}

/** Preview-only filled build. Used when the live build has no slotted parts yet. */
export function withDemoBuild(build: PCBuild): PCBuild {
  const existing = new Map((build.items ?? []).filter((item) => item?.slot).map((item) => [item.slot, item]));
  if (SLOT_ORDER.every((slot) => existing.has(slot))) return build;

  const items = SLOT_ORDER.map((slot, index) => existing.get(slot) ?? toItem(DEMO_PARTS.find((entry) => entry.slot === slot)!, index));
  const demoOnly = SLOT_ORDER.every((slot) => items.find((item) => item.slot === slot)?.id.startsWith("demo-"));
  const subtotal = demoOnly
    ? DEMO_PARTS.reduce((sum, part) => sum + Number(part.price), 0)
    : items.reduce((sum, item) => sum + Number(item.unit_price || 0), 0);
  const discountPercent = items.length >= 9 ? 15 : items.length >= 7 ? 12 : items.length >= 5 ? 8 : items.length >= 3 ? 5 : 0;
  const total = subtotal * (1 - discountPercent / 100);
  const watts = demoOnly ? DEMO_PARTS.reduce((sum, part) => sum + part.watts, 0) : build.total_power_draw_watts;

  return {
    ...build,
    name: build.name || "Black Mamba Demo Rig",
    name_ar: build.name_ar || "جهاز بلاك مامبا التجريبي",
    preference_processor_brand: build.preference_processor_brand === "ANY" ? "AMD" : build.preference_processor_brand,
    preference_graphics_brand: build.preference_graphics_brand === "ANY" ? "NVIDIA" : build.preference_graphics_brand,
    preference_color: build.preference_color === "ANY" ? "BLACK" : build.preference_color,
    items,
    total_power_draw_watts: watts || 411,
    has_blocking_issues: false,
    compatibility: { red_issues: [], yellow_issues: [] },
    pricing: {
      subtotal: subtotal.toFixed(2),
      discount_percent: String(discountPercent),
      total_price: total.toFixed(2),
      part_count: items.length,
      next_tier: items.length >= 9 ? null : build.pricing?.next_tier ?? null,
    },
  };
}

import {
  SLOT_ORDER,
  type PCBuild,
  type PCBuildItemData,
  type PCPart,
  type PCSlot,
} from "@/features/pc-builder/types";

type DemoPart = {
  slot: PCSlot;
  name: string;
  name_ar: string;
  price: string;
  watts: number;
  spec: Partial<NonNullable<PCPart["spec"]>>;
  thumbnail?: string | null;
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
  {
    slot: "MONITOR",
    name: 'ASUS TUF Gaming VG27AQ 27" 165Hz',
    name_ar: 'أسوس TUF Gaming VG27AQ 27 بوصة',
    price: "249.00",
    watts: 35,
    spec: { color: "BLACK" },
    thumbnail:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80",
  },
  {
    slot: "KEYBOARD",
    name: "Logitech G Pro X TKL Mechanical",
    name_ar: "لوجيتك G Pro X TKL ميكانيكي",
    price: "89.00",
    watts: 0,
    spec: { color: "BLACK" },
    thumbnail:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80",
  },
  {
    slot: "MOUSE",
    name: "Logitech G Pro X Superlight 2",
    name_ar: "لوجيتك G Pro X Superlight 2",
    price: "99.00",
    watts: 0,
    spec: { color: "BLACK" },
    thumbnail:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=200&q=80",
  },
  {
    slot: "HEADSET",
    name: "SteelSeries Arctis Nova Pro",
    name_ar: "ستيل سيريز Arctis Nova Pro",
    price: "229.00",
    watts: 0,
    spec: { color: "BLACK" },
    thumbnail:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=200&q=80",
  },
  {
    slot: "MOUSEPAD",
    name: "Artisan Hien Soft XL Mousepad",
    name_ar: "آرتيزان هين سوفت XL",
    price: "45.00",
    watts: 0,
    spec: { color: "BLACK" },
    thumbnail:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7cde81?auto=format&fit=crop&w=200&q=80",
  },
];

/** Extra picker options per slot (demo catalogue when API is empty). */
const DEMO_PICKER_EXTRAS: Partial<Record<PCSlot, DemoPart[]>> = {
  MONITOR: [
    {
      slot: "MONITOR",
      name: 'LG UltraGear 27GP850 27" 180Hz',
      name_ar: 'إل جي UltraGear 27GP850',
      price: "279.00",
      watts: 40,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=200&q=80",
    },
    {
      slot: "MONITOR",
      name: 'Samsung Odyssey G5 32" 165Hz',
      name_ar: 'سامسونج Odyssey G5 32 بوصة',
      price: "219.00",
      watts: 45,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&w=200&q=80",
    },
  ],
  KEYBOARD: [
    {
      slot: "KEYBOARD",
      name: "Razer BlackWidow V4 Tenkeyless",
      name_ar: "ريزر BlackWidow V4",
      price: "109.00",
      watts: 0,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=200&q=80",
    },
  ],
  MOUSE: [
    {
      slot: "MOUSE",
      name: "Razer Viper V3 Pro",
      name_ar: "ريزر Viper V3 Pro",
      price: "119.00",
      watts: 0,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7cde81?auto=format&fit=crop&w=200&q=80",
    },
  ],
  HEADSET: [
    {
      slot: "HEADSET",
      name: "HyperX Cloud III Wireless",
      name_ar: "هايبر إكس Cloud III",
      price: "129.00",
      watts: 0,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=200&q=80",
    },
  ],
  MOUSEPAD: [
    {
      slot: "MOUSEPAD",
      name: "SteelSeries QcK Heavy XXL",
      name_ar: "ستيل سيريز QcK Heavy XXL",
      price: "35.00",
      watts: 0,
      spec: { color: "BLACK" },
      thumbnail:
        "https://images.unsplash.com/photo-1625842268584-e998d97cc0a9?auto=format&fit=crop&w=200&q=80",
    },
  ],
};

function toPart(part: DemoPart, suffix = ""): PCPart {
  const id = `demo-${part.slot.toLowerCase()}${suffix}`;
  return {
    id,
    name: part.name,
    name_ar: part.name_ar,
    slug: id,
    thumbnail: part.thumbnail ?? null,
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
}

function toItem(part: DemoPart, index: number): PCBuildItemData {
  const product = toPart(part);
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

/** Demo catalogue for picker when the API returns no parts for a slot. */
export function getDemoPartsForSlot(slot: PCSlot): PCPart[] {
  const primary = DEMO_PARTS.find((p) => p.slot === slot);
  const extras = DEMO_PICKER_EXTRAS[slot] ?? [];
  const list: PCPart[] = [];
  if (primary) list.push(toPart(primary));
  extras.forEach((part, i) => list.push(toPart(part, `-alt${i + 1}`)));
  return list;
}

/** Preview-only filled build. Used when the live build has no slotted parts yet. */
export function withDemoBuild(build: PCBuild): PCBuild {
  const existing = new Map(
    (build.items ?? []).filter((item) => item?.slot).map((item) => [item.slot, item])
  );
  if (SLOT_ORDER.every((slot) => existing.has(slot))) return build;

  const items = SLOT_ORDER.map(
    (slot, index) =>
      existing.get(slot) ?? toItem(DEMO_PARTS.find((entry) => entry.slot === slot)!, index)
  );
  const demoOnly = SLOT_ORDER.every((slot) =>
    items.find((item) => item.slot === slot)?.id.startsWith("demo-")
  );
  const subtotal = demoOnly
    ? DEMO_PARTS.reduce((sum, part) => sum + Number(part.price), 0)
    : items.reduce((sum, item) => sum + Number(item.unit_price || 0), 0);
  const discountPercent =
    items.length >= 12 ? 15 : items.length >= 9 ? 12 : items.length >= 7 ? 8 : items.length >= 5 ? 5 : 0;
  const total = subtotal * (1 - discountPercent / 100);
  const watts = demoOnly
    ? DEMO_PARTS.reduce((sum, part) => sum + part.watts, 0)
    : build.total_power_draw_watts;

  return {
    ...build,
    name: build.name || "Black Mamba Demo Rig",
    name_ar: build.name_ar || "جهاز بلاك مامبا التجريبي",
    preference_processor_brand:
      build.preference_processor_brand === "ANY" ? "AMD" : build.preference_processor_brand,
    preference_graphics_brand:
      build.preference_graphics_brand === "ANY" ? "NVIDIA" : build.preference_graphics_brand,
    preference_color: build.preference_color === "ANY" ? "BLACK" : build.preference_color,
    items,
    total_power_draw_watts: watts || 446,
    has_blocking_issues: false,
    compatibility: { red_issues: [], yellow_issues: [] },
    pricing: {
      subtotal: subtotal.toFixed(2),
      discount_percent: String(discountPercent),
      total_price: total.toFixed(2),
      part_count: items.length,
      next_tier: items.length >= 12 ? null : build.pricing?.next_tier ?? null,
    },
  };
}

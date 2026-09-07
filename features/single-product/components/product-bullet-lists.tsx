import { cn } from "@/lib/utils";
import type { ProductTable } from "@/types/product";

export type SpecBullet = { label: string; value: string };
export type FeatureBullet = { title: string; body: string };

function splitLabelValue(raw: string): { label: string; value: string } | null {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const idx = text.search(/[:：]/);
  if (idx <= 0 || idx >= text.length - 1) return { label: text, value: "" };
  return {
    label: text.slice(0, idx).trim(),
    value: text.slice(idx + 1).trim(),
  };
}

function asList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return trimmed
        .split(/\n+|•/g)
        .map((line) => line.replace(/^[-–]\s*/, "").trim())
        .filter(Boolean);
    }
  }
  return [];
}

function fromUnknownItem(item: unknown): { label: string; value: string } | null {
  if (typeof item === "string") return splitLabelValue(item);
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;
  const label = String(
    rec.title ?? rec.label ?? rec.name ?? rec.key ?? rec.feature ?? rec.heading ?? ""
  ).trim();
  const value = String(
    rec.value ?? rec.description ?? rec.body ?? rec.text ?? rec.detail ?? ""
  ).trim();
  if (label && value) return { label, value };
  if (label) return { label, value: "" };
  return null;
}

export function bulletsFromProduct(opts: {
  table: ProductTable | null;
  features: unknown;
  isAr: boolean;
}): { specs: SpecBullet[]; features: FeatureBullet[] } {
  const specs: SpecBullet[] = [];

  if (opts.table?.rows?.length) {
    const rows = [...opts.table.rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const row of rows.slice(0, 8)) {
      const label = opts.isAr && row.feature_ar ? row.feature_ar : row.feature;
      const value = (row.values ?? []).filter(Boolean).join(", ");
      if (label && value) specs.push({ label, value });
    }
  }

  const features: FeatureBullet[] = [];
  for (const item of asList(opts.features)) {
    const parsed = fromUnknownItem(item);
    if (!parsed) continue;
    const { label, value } = parsed;
    const isShortSpec = value.length > 0 && value.length <= 48 && !/[.!?。]/.test(value);
    if (!opts.table && isShortSpec) {
      specs.push({ label, value });
      continue;
    }
    if (value) features.push({ title: label, body: value });
    else features.push({ title: label, body: "" });
  }

  return { specs, features };
}

export function ProductBulletLists({
  specs,
  features,
  isAr,
}: {
  specs: SpecBullet[];
  features: FeatureBullet[];
  isAr: boolean;
}) {
  if (specs.length === 0 && features.length === 0) return null;

  return (
    <div className={cn("mt-6", isAr && "font-cairo")}>
      {specs.length > 0 ? (
        <ul className="space-y-2.5 border-t border-border pt-5">
          {specs.map((item) => (
            <li key={`${item.label}:${item.value}`} className="flex items-start gap-2.5 text-[14px] leading-snug">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
              <p className="text-foreground">
                <span className="font-semibold">{item.label}:</span>{" "}
                <span className="font-normal">{item.value}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {features.length > 0 ? (
        <ul className="mt-5 space-y-3.5 border-t border-border pt-5">
          {features.map((item) => (
            <li key={`${item.title}:${item.body}`} className="flex items-start gap-2.5 text-[14px] leading-[1.55]">
              <span className="mt-[7px] size-[5px] shrink-0 bg-foreground" aria-hidden />
              <p>
                <span className="font-semibold text-foreground">{item.title}{item.body ? ":" : ""}</span>
                {item.body ? (
                  <>
                    {" "}
                    <span className="font-normal text-muted-foreground">{item.body}</span>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

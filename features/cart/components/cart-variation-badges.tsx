import type { CartItem } from "@/features/cart/types";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface Attr {
  label: string;
  value: string;
  displayValue: string;
  isColor: boolean;
}

function getVariationAttrs(item: CartItem, locale: string): Attr[] {
  const isAr = locale === "ar";

  if (item.variation && item.variation_details) {
    for (const group of item.product_details?.available_variations ?? []) {
      const option = group.options.find((o) => o.variation_id === item.variation);
      if (option) {
        return [
          {
            label: isAr && group.name_ar ? group.name_ar : group.name,
            value: option.value,
            displayValue: isAr && option.value_ar ? option.value_ar : option.value,
            isColor: HEX_RE.test(option.value),
          },
        ];
      }
    }
    // Fallback: show the pre-formatted string
    return [
      {
        label: "",
        value: item.variation_details.attribute_names,
        displayValue: item.variation_details.attribute_names,
        isColor: false,
      },
    ];
  }

  if (item.combination && item.combination_details) {
    const combo = (item.product_details?.available_combinations ?? []).find(
      (c) => c.id === item.combination
    );
    if (combo) {
      return combo.selected_options.map((opt) => ({
        label: isAr && opt.attribute_ar ? opt.attribute_ar : opt.attribute,
        value: opt.value,
        displayValue: isAr && opt.value_ar ? opt.value_ar : opt.value,
        isColor: HEX_RE.test(opt.value),
      }));
    }
  }

  return [];
}

interface Props {
  item: CartItem;
  locale: string;
  /** Extra classes on the wrapper div */
  className?: string;
}

export function CartVariationBadges({ item, locale, className }: Props) {
  const attrs = getVariationAttrs(item, locale);
  if (attrs.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className ?? ""}`}>
      {attrs.map((attr, i) => (
        <span key={i} className="flex items-center gap-1">
          {attr.label && (
            <span className="text-[11px] text-white/45">{attr.label}:</span>
          )}
          {attr.isColor ? (
            <span
              className="inline-block size-[14px] rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: attr.value }}
              title={attr.displayValue}
            />
          ) : (
            <span className="text-[12px] font-medium text-white/70">{attr.displayValue}</span>
          )}
        </span>
      ))}
    </div>
  );
}

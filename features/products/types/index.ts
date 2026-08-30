export interface FilterValue {
  id: string;
  value: string;
  value_ar: string | null;
  key: string;
  sort_order: number;
}

export interface Filter {
  id: string;
  name: string;
  name_ar: string | null;
  key: string;
  description: string;
  is_multiple: boolean;
  values: FilterValue[];
}

export type SortValue =
  | "-created_at"
  | "created_at"
  | "base_price"
  | "-base_price";

export interface SortOption {
  value: SortValue;
  labelKey: "sort.latest" | "sort.oldest" | "sort.priceAsc" | "sort.priceDesc";
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "-created_at", labelKey: "sort.latest" },
  { value: "created_at", labelKey: "sort.oldest" },
  { value: "base_price", labelKey: "sort.priceAsc" },
  { value: "-base_price", labelKey: "sort.priceDesc" },
];

export const DEFAULT_SORT: SortValue = "-created_at";

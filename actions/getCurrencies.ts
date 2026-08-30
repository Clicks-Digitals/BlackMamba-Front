import { apiClient } from "@/lib/api/client";
import type { Currency } from "@/types/currency";

type CurrenciesPage = {
  results: Currency[];
};

export const DEFAULT_CURRENCY = "JOD";

export async function getCurrencies(): Promise<Currency[]> {
  const res = await apiClient<CurrenciesPage>("/logistics/currencies/");

  if (!res.ok) return [];
  return res.data?.results ?? [];
}

import { apiClient } from "@/lib/api/client";
import type { Currency } from "@/types/currency";

type CurrenciesPage = {
  results: Currency[];
};

export const DEFAULT_CURRENCY = "JOD";

export async function getCurrencies(): Promise<Currency[]> {
  // Configuration, not content — it changes almost never, and this call sits
  // in the layout, so uncached it cost a round trip on every single page.
  const res = await apiClient<CurrenciesPage>("/logistics/currencies/", { revalidate: 300 });

  if (!res.ok) return [];
  return res.data?.results ?? [];
}

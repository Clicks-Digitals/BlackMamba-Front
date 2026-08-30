/** Accepts either a DRF paginated payload or a bare array. */
export function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

export function isBlankParent(parent: unknown): boolean {
  return parent == null || parent === "" || parent === "none" || parent === "null";
}

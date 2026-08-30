/**
 * Strips empty strings and undefined/null values from an object.
 * Useful for preparing JSON payloads for APIs that reject empty strings for optional fields.
 */
export function cleanPayload<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  ) as Partial<T>;
}

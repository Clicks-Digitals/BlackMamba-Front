/**
 * Central API configuration.
 * Server-only — not exposed to the browser.
 *
 * This codebase reads `API_BASE_URL`. The .env from josouk-frontend uses
 * `BACK_API_URL` / `PROD_API_BASE_URL` instead, so those are accepted too.
 */
function resolveApiBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL ||
    process.env.BACK_API_URL ||
    process.env.PROD_API_BASE_URL ||
    "";
  return raw.replace(/\/$/, "");
}

export const API_CONFIG = {
  /** Base URL prepended to every endpoint string in apiClient(). */
  baseUrl: resolveApiBaseUrl(),

  /** Default request headers sent with every call. */
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },

  /** Default cache strategy for fetch calls without explicit cache or next options. */
  defaultCache: "no-store" as RequestCache
} as const;

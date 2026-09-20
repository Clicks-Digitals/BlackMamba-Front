/**
 * Analytics IDs. Both are NEXT_PUBLIC_* because the tags load in the browser -
 * a measurement ID and a pixel ID are public by design and carry no secret.
 * The Meta *access token* is server-side only and lives in the backend.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export const isGaEnabled = Boolean(GA_MEASUREMENT_ID);
export const isPixelEnabled = Boolean(META_PIXEL_ID);
export const isAnalyticsEnabled = isGaEnabled || isPixelEnabled;

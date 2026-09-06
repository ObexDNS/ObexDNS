import { numericToAlpha2 } from "../views/AnalyticsView/countryMapping";

/**
 * Complete list of ISO 3166-1 alpha-2 country and region codes,
 * deduplicated and sorted alphabetically.
 */
export const ALL_COUNTRY_CODES: string[] = Array.from(
  new Set(Object.values(numericToAlpha2))
).sort((a, b) => a.localeCompare(b));

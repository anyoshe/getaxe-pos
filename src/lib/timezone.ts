/**
 * Business timezone for GetAxe (Kenya).
 * All "calendar day" logic and user-facing dates use this zone —
 * independent of server OS timezone (often UTC).
 */
export const BUSINESS_TIMEZONE = "Africa/Nairobi";

/** Format a date/time for display in Nairobi. */
export function formatDateTimeNairobi(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: BUSINESS_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  }).format(d);
}

export function formatDateNairobi(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: BUSINESS_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/**
 * Start / end of "today" in Africa/Nairobi as UTC Date bounds
 * for SQL comparisons (timestamptz).
 */
export function nairobiDayBounds(reference = new Date()): {
  start: Date;
  end: Date;
} {
  // Format calendar parts in Nairobi
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(reference);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  // Nairobi is always UTC+3 (no DST)
  // Local midnight Nairobi = previous day 21:00 UTC
  const start = new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0) - 3 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

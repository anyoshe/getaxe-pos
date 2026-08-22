/**
 * Business timezone: Africa/Nairobi (EAT, UTC+3, no DST).
 *
 * Columns use `timestamp` WITHOUT time zone. node-pg returns those as JS Dates
 * whose UTC fields equal the stored wall-clock. If we store Nairobi local time
 * in the column, format with timeZone "UTC" to show that clock — do NOT apply
 * Africa/Nairobi again or times shift +3h into the next calendar day.
 */
export const BUSINESS_TIMEZONE = "Africa/Nairobi";

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Nairobi wall-clock as Date with UTC fields = local EAT (for timestamp w/o tz). */
export function nowNairobiWallClock(): Date {
  const p = partsInZone(new Date(), BUSINESS_TIMEZONE);
  return new Date(
    Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second),
  );
}

export function formatDateTimeNairobi(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: "UTC",
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
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/** Today in Nairobi as naive UTC-field bounds for timestamp-without-tz SQL. */
export function nairobiDayBounds(reference = new Date()): {
  start: Date;
  end: Date;
} {
  const p = partsInZone(reference, BUSINESS_TIMEZONE);
  const start = new Date(Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0, 0));
  return { start, end };
}

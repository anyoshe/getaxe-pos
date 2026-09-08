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

/** Period bounds in Nairobi wall-clock (naive UTC fields for timestamp w/o tz). */
export function nairobiPeriodBounds(
  period: "day" | "week" | "month",
  reference = new Date(),
): { start: Date; end: Date; label: string } {
  const p = partsInZone(reference, BUSINESS_TIMEZONE);
  const end = new Date(Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0));

  if (period === "day") {
    const start = new Date(Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0));
    return {
      start,
      end,
      label: `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`,
    };
  }

  if (period === "week") {
    // Last 7 calendar days including today
    const start = new Date(Date.UTC(p.year, p.month - 1, p.day - 6, 0, 0, 0));
    return { start, end, label: "Last 7 days" };
  }

  // month: from 1st of current Nairobi month
  const start = new Date(Date.UTC(p.year, p.month - 1, 1, 0, 0, 0));
  return {
    start,
    end,
    label: `${p.year}-${String(p.month).padStart(2, "0")}`,
  };
}

/**
 * Inclusive calendar days in Africa/Nairobi as naive timestamps matching
 * nowNairobiWallClock() / soldAt storage (UTC fields = EAT wall clock).
 * end is exclusive (start of day after toDate).
 */
export function nairobiDateRangeBounds(
  fromDate: string,
  toDate: string,
): { start: Date; end: Date } {
  const fp = fromDate.split("-").map(Number);
  const tp = toDate.split("-").map(Number);
  if (fp.length < 3 || tp.length < 3) {
    throw new Error("Dates must be YYYY-MM-DD");
  }
  const start = new Date(Date.UTC(fp[0], fp[1] - 1, fp[2], 0, 0, 0, 0));
  // exclusive end = midnight at start of the day after toDate
  const end = new Date(Date.UTC(tp[0], tp[1] - 1, tp[2] + 1, 0, 0, 0, 0));
  return { start, end };
}

/** Single Nairobi calendar day [start, end). */
export function nairobiDateBounds(dateStr: string): { start: Date; end: Date } {
  return nairobiDateRangeBounds(dateStr, dateStr);
}

/** Today YYYY-MM-DD in Africa/Nairobi. */
export function todayNairobiDateString(reference = new Date()): string {
  const p = partsInZone(reference, BUSINESS_TIMEZONE);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}


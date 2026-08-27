/** Drizzle numeric columns are typed as string — coerce for math. */
export function qty(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Format number for numeric column inserts. */
export function qtyStr(value: string | number | null | undefined): string {
  return String(qty(value));
}

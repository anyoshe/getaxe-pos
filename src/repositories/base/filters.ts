import { SQL, and } from "drizzle-orm";

export type Filter = SQL | undefined | null | false;

export function buildWhere(
  ...filters: Filter[]
): SQL | undefined {
  const valid = filters.filter(
    (filter): filter is SQL => Boolean(filter)
  );

  if (valid.length === 0) {
    return undefined;
  }

  if (valid.length === 1) {
    return valid[0];
  }

  return and(...valid);
}
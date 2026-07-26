import { SQL, asc, desc } from "drizzle-orm";
import { SortOptions } from "./types";

export type SortFieldMap = Record<string, SQL>;

export function getOrderBy(
  options: SortOptions | undefined,
  fields: SortFieldMap,
): SQL | undefined {
  if (!options?.field) {
    return undefined;
  }

  const column = fields[options.field];

  if (!column) {
    return undefined;
  }

  return options.direction === "desc"
    ? desc(column)
    : asc(column);
}
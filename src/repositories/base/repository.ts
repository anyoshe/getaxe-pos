import { db } from "@/db";
import { buildWhere } from "./filters";
import { getPagination, getPageCount } from "./pagination";
import { getOrderBy } from "./sorting";
import { withTransaction } from "./transaction";

export const Repository = {
  db,
  buildWhere,
  getPagination,
  getPageCount,
  getOrderBy,
  withTransaction,
};

export type RepositoryContext = typeof Repository;
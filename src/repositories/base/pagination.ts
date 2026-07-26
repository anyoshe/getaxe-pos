import { PaginationOptions } from "./types";

export interface PaginationResult {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function getPagination(
  options?: PaginationOptions
): PaginationResult {
  const page = Math.max(DEFAULT_PAGE, options?.page ?? DEFAULT_PAGE);

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options?.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function getPageCount(
  total: number,
  pageSize: number
): number {
  return Math.ceil(total / pageSize);
}
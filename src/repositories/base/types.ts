export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface SortOptions {
  field?: string;
  direction?: "asc" | "desc";
}

export interface SearchOptions {
  query?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListRepositoryResult<T> {
  success: boolean;
  data: T[];
  total: number;
}

export type RepositoryId = string;
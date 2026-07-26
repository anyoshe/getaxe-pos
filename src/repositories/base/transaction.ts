import { db } from "@/db";

/**
 * Execute a function inside a database transaction.
 */
export async function withTransaction<T>(
  callback: Parameters<typeof db.transaction>[0]
): Promise<T> {
  return db.transaction(callback) as Promise<T>;
}
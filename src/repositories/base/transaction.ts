import { db } from "@/db";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Execute a function inside a database transaction.
 */
export async function withTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(callback) as Promise<T>;
}
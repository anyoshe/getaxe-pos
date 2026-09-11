import { db } from "@/db";

type TxCallback = Parameters<typeof db.transaction>[0];
type Tx = Parameters<TxCallback>[0];

/**
 * Execute a function inside a database transaction.
 * Return type is inferred from the callback.
 */
export async function withTransaction<T>(
  callback: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(callback);
}

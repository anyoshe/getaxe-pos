/** Client-only outbox for mutations that must survive offline gaps. */

export type OutboxSalePayload = {
  warehouseId: string;
  branchId: string;
  customerId: string | null;
  notes: string | null;
  paymentMethod: "CASH" | "MPESA" | "CARD" | "MOBILE_MONEY" | "CREDIT";
  items: Array<{
    productId: string;
    quantity: number;
    unitId: string | null;
    preferredBatchIds: string[];
    unitPrice: number;
    serialNumbers: string[];
  }>;
  /** Resolve customer on sync before posting the sale */
  pendingCustomer?: {
    phone: string;
    firstName: string | null;
  } | null;
  /** Snapshot for cashier UI while queued */
  totalHint?: number;
};

export type OutboxItem = {
  id: string;
  type: "create_sale";
  createdAt: string;
  payload: OutboxSalePayload;
  attempts: number;
  lastError?: string;
};

const DB_NAME = "getaxe-offline";
const DB_VERSION = 1;
const STORE = "outbox";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB tx failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IDB tx aborted"));
  });
}

export async function outboxEnqueue(item: OutboxItem): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(item);
  await txDone(tx);
  db.close();
}

export async function outboxList(): Promise<OutboxItem[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as OutboxItem[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function outboxRemove(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  await txDone(tx);
  db.close();
}

export async function outboxUpdate(item: OutboxItem): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(item);
  await txDone(tx);
  db.close();
}

export function newOutboxId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ob_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

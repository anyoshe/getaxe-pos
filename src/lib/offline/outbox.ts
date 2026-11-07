/** Client-only outbox for mutations that must survive offline gaps. */

export type OutboxSalePayload = {
  warehouseId: string;
  branchId: string;
  customerId: string | null;
  notes: string | null;
  paymentMethod:
    | "CASH"
    | "MPESA"
    | "CARD"
    | "BANK_TRANSFER"
    | "CHEQUE"
    | "MOBILE_MONEY"
    | "CREDIT";
  cashAccountId?: string | null;
  paymentReference?: string | null;
  paymentDetail?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    unitId: string | null;
    preferredBatchIds: string[];
    unitPrice: number;
    serialNumbers: string[];
    name?: string;
  }>;
  pendingCustomer?: {
    phone: string;
    firstName: string | null;
  } | null;
  totalHint?: number;
  /** Same id sent to server as clientSaleId — prevents double post on retry */
  clientSaleId: string;
};

export type OutboxItem = {
  id: string;
  type: "create_sale";
  createdAt: string;
  payload: OutboxSalePayload;
  attempts: number;
  lastError?: string;
  status?: "pending" | "failed";
};

const DB_NAME = "getaxe-offline";
const DB_VERSION = 2;
const STORE = "outbox";
const CATALOG_STORE = "pos_catalog";

export const OUTBOX_MAX_ATTEMPTS = 8;

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
      if (!db.objectStoreNames.contains(CATALOG_STORE)) {
        db.createObjectStore(CATALOG_STORE, { keyPath: "key" });
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
  tx.objectStore(STORE).put({ ...item, status: item.status ?? "pending" });
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

export function offlineInvoiceLabel(clientSaleId: string): string {
  const short = clientSaleId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `OFFLINE-${short}`;
}

export type PosCatalogSnapshot = {
  key: "pos";
  savedAt: string;
  businessId?: string;
  products: unknown[];
  stockByProductWarehouse: Record<string, Record<string, number>>;
};

export async function savePosCatalog(
  snapshot: Omit<PosCatalogSnapshot, "key">,
): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(CATALOG_STORE, "readwrite");
    tx.objectStore(CATALOG_STORE).put({ key: "pos", ...snapshot });
    await txDone(tx);
    db.close();
  } catch {
    /* ignore */
  }
}

export async function loadPosCatalog(): Promise<PosCatalogSnapshot | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(CATALOG_STORE, "readonly");
    const row = await new Promise<PosCatalogSnapshot | undefined>(
      (resolve, reject) => {
        const req = tx.objectStore(CATALOG_STORE).get("pos");
        req.onsuccess = () =>
          resolve(req.result as PosCatalogSnapshot | undefined);
        req.onerror = () => reject(req.error);
      },
    );
    await txDone(tx);
    db.close();
    return row ?? null;
  } catch {
    return null;
  }
}

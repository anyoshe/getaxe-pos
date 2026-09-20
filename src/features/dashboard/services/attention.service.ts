import { and, eq, sql, desc, asc, isNotNull, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productBatches } from "@/db/schema/inventory/product_batches";
import { sales } from "@/db/schema/sales/sales";
import { customers } from "@/db/schema/sales/customers";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { suppliers } from "@/db/schema/inventory/suppliers";
import { expenses } from "@/db/schema/finance/expenses";
import { expenseCategories } from "@/db/schema/finance/expense_categories";
import { warehouses } from "@/db/schema/settings/warehouses";
import { nairobiDayBounds } from "@/lib/timezone";
import { getLowStockProducts } from "@/features/inventory/queries/low-stock.query";

export type AttentionKind =
  | "restock"
  | "expiry"
  | "receivable"
  | "payable"
  | "slow"
  | "expense";

export type RestockLine = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  reorderLevel: number;
  suggestedOrderQty: number;
  costPrice: number;
  supplierId: string | null;
};

export type ExpiryLine = {
  batchId: string;
  productId: string;
  productName: string;
  sku: string | null;
  batchNumber: string;
  expiryDate: string;
  quantityRemaining: number;
  warehouseId: string | null;
  warehouseName: string | null;
  costPrice: number;
};

export type ReceivableLine = {
  saleId: string;
  invoiceNumber: string;
  customerName: string;
  phone: string | null;
  soldAt: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  daysOpen: number;
};

export type PayableLine = {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string | null;
  total: number;
  balanceDue: number;
  daysUntilDue: number | null;
  overdue: boolean;
};

export type SlowLine = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  stockValue: number;
};

export type ExpenseLine = {
  id: string;
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  status: string;
  paidTo: string | null;
};

export type AttentionBundle = {
  kind: AttentionKind;
  title: string;
  restock: RestockLine[];
  expiry: ExpiryLine[];
  receivables: ReceivableLine[];
  payables: PayableLine[];
  slow: SlowLine[];
  expenses: ExpenseLine[];
};

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

function toDateString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s.slice(0, 10) : d.toISOString().slice(0, 10);
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  return new Date(String(value ?? ""));
}


export async function loadAttentionBundle(
  businessId: string,
  kind: AttentionKind,
): Promise<AttentionBundle> {
  const { start: today } = nairobiDayBounds();
  const todayStr = today.toISOString().slice(0, 10);
  const ninety = new Date(today);
  ninety.setDate(ninety.getDate() + 90);
  const ninetyStr = ninety.toISOString().slice(0, 10);
  const thirtyAgo = new Date(today);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const titles: Record<AttentionKind, string> = {
    restock: "Restock — products at or below reorder level",
    expiry: "Batches expiring within 90 days",
    receivable: "Customer debts to collect",
    payable: "Unpaid supplier invoices",
    slow: "Stock with no sales in 30 days",
    expense: "Recent & upcoming expenses",
  };

  const empty: AttentionBundle = {
    kind,
    title: titles[kind],
    restock: [],
    expiry: [],
    receivables: [],
    payables: [],
    slow: [],
    expenses: [],
  };

  if (kind === "restock") {
    const rows = await getLowStockProducts({ businessId }).catch(() => []);
    const map = new Map<string, RestockLine>();
    for (const r of rows as {
      productId: string;
      productName: string;
      sku: string | null;
      currentQuantity: number;
      reorderLevel: number | null;
      costPrice?: number | string | null;
    }[]) {
      const qty = Number(r.currentQuantity ?? 0);
      const reorder = Number(r.reorderLevel ?? 0);
      const suggested = Math.max(reorder * 2 - qty, reorder, 1);
      const existing = map.get(r.productId);
      if (!existing || qty < existing.quantity) {
        map.set(r.productId, {
          productId: r.productId,
          name: r.productName,
          sku: r.sku,
          quantity: qty,
          reorderLevel: reorder,
          suggestedOrderQty: Math.ceil(suggested),
          costPrice: Number(r.costPrice ?? 0),
          supplierId: null,
        });
      }
    }
    // Enrich cost + preferred supplier from products
    const ids = [...map.keys()];
    if (ids.length) {
      const prods = await db
        .select({
          id: products.id,
          costPrice: products.costPrice,
          supplierId: products.supplierId,
        })
        .from(products)
        .where(eq(products.businessId, businessId))
        .catch(() => []);
      for (const p of prods) {
        const line = map.get(p.id);
        if (line) {
          line.costPrice = Number(p.costPrice ?? line.costPrice);
          line.supplierId = p.supplierId ?? null;
        }
      }
    }
    empty.restock = [...map.values()].sort((a, b) => a.quantity - b.quantity);
    return empty;
  }

  if (kind === "expiry") {
    const rows = await db
      .select({
        batchId: productBatches.id,
        productId: products.id,
        productName: products.name,
        sku: products.sku,
        batchNumber: productBatches.batchNumber,
        expiryDate: productBatches.expiryDate,
        quantityRemaining: productBatches.quantityRemaining,
        costPrice: productBatches.costPrice,
      })
      .from(productBatches)
      .innerJoin(products, eq(productBatches.productId, products.id))
      .where(
        and(
          eq(productBatches.businessId, businessId),
          eq(productBatches.active, true),
          isNotNull(productBatches.expiryDate),
          sql`coalesce(${productBatches.quantityRemaining}::numeric, 0) > 0`,
          sql`${productBatches.expiryDate}::date <= ${ninetyStr}::date`,
          sql`${productBatches.expiryDate}::date >= ${todayStr}::date`,
        ),
      )
      .orderBy(asc(productBatches.expiryDate))
      .limit(50)
      .catch(() => []);

    // Prefer warehouse from inventory_balances for product
    const bal = await db
      .select({
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        warehouseName: warehouses.name,
        qty: inventoryBalances.quantity,
      })
      .from(inventoryBalances)
      .leftJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
      .where(
        and(
          eq(inventoryBalances.businessId, businessId),
          sql`coalesce(${inventoryBalances.quantity}::numeric, 0) > 0`,
        ),
      )
      .catch(() => []);
    const whByProduct = new Map<string, { id: string; name: string }>();
    for (const b of bal) {
      if (!whByProduct.has(b.productId) && b.warehouseId) {
        whByProduct.set(b.productId, {
          id: b.warehouseId,
          name: b.warehouseName ?? "Warehouse",
        });
      }
    }

    empty.expiry = rows.map((r) => {
      const wh = whByProduct.get(r.productId);
      return {
        batchId: r.batchId,
        productId: r.productId,
        productName: r.productName,
        sku: r.sku,
        batchNumber: r.batchNumber,
        expiryDate: toDateString(r.expiryDate),
        quantityRemaining: Number(r.quantityRemaining ?? 0),
        warehouseId: wh?.id ?? null,
        warehouseName: wh?.name ?? null,
        costPrice: Number(r.costPrice ?? 0),
      };
    });
    return empty;
  }

  if (kind === "receivable") {
    const rows = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        soldAt: sales.soldAt,
        total: sales.total,
        amountPaid: sales.amountPaid,
        balanceDue: sales.balanceDue,
        companyName: customers.companyName,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        customerType: customers.customerType,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
          sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
        ),
      )
      .orderBy(asc(sales.soldAt))
      .limit(100)
      .catch(() => []);

    empty.receivables = rows.map((r) => {
      const isBiz = r.customerType === "BUSINESS";
      const person = [r.firstName, r.lastName].filter(Boolean).join(" ");
      const customerName = isBiz
        ? r.companyName || person || "Customer"
        : person || r.companyName || "Customer";
      const sold = toDate(r.soldAt);
      return {
        saleId: r.id,
        invoiceNumber: r.invoiceNumber,
        customerName,
        phone: r.phone,
        soldAt: sold.toISOString(),
        total: Number(r.total ?? 0),
        amountPaid: Number(r.amountPaid ?? 0),
        balanceDue: Number(r.balanceDue ?? 0),
        daysOpen: daysBetween(sold, today),
      };
    });
    return empty;
  }

  if (kind === "payable") {
    const rows = await db
      .select({
        id: supplierInvoices.id,
        invoiceNumber: supplierInvoices.invoiceNumber,
        invoiceDate: supplierInvoices.invoiceDate,
        dueDate: supplierInvoices.dueDate,
        total: supplierInvoices.total,
        balanceDue: supplierInvoices.balanceDue,
        supplierName: suppliers.name,
      })
      .from(supplierInvoices)
      .innerJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
      .where(
        and(
          eq(supplierInvoices.businessId, businessId),
          sql`coalesce(${supplierInvoices.balanceDue}::numeric, 0) > 0.009`,
        ),
      )
      .orderBy(asc(supplierInvoices.dueDate))
      .limit(100)
      .catch(() => []);

    empty.payables = rows.map((r) => {
      const due = r.dueDate ? toDate(r.dueDate) : null;
      const inv = toDate(r.invoiceDate);
      const daysUntilDue = due ? daysBetween(today, due) : null;
      return {
        invoiceId: r.id,
        invoiceNumber: r.invoiceNumber,
        supplierName: r.supplierName,
        invoiceDate: inv.toISOString().slice(0, 10),
        dueDate: due ? due.toISOString().slice(0, 10) : null,
        total: Number(r.total ?? 0),
        balanceDue: Number(r.balanceDue ?? 0),
        daysUntilDue,
        overdue: daysUntilDue !== null ? daysUntilDue < 0 : false,
      };
    });
    return empty;
  }

  if (kind === "slow") {
    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        quantity: sql<string>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
        costPrice: products.costPrice,
      })
      .from(products)
      .innerJoin(
        inventoryBalances,
        and(
          eq(inventoryBalances.productId, products.id),
          eq(inventoryBalances.businessId, businessId),
        ),
      )
      .where(
        and(
          eq(products.businessId, businessId),
          eq(products.active, true),
          eq(products.trackInventory, true),
          sql`not exists (
            select 1 from sale_items si
            inner join sales s on s.id = si.sale_id
            where si.product_id = ${products.id}
              and si.business_id = ${businessId}
              and s.status = 'COMPLETED'
              and s.sold_at >= ${thirtyAgo}
          )`,
        ),
      )
      .groupBy(products.id, products.name, products.sku, products.costPrice)
      .having(sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0) > 0`)
      .orderBy(desc(sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`))
      .limit(40)
      .catch(() => []);

    empty.slow = rows.map((r) => {
      const qty = Number(r.quantity ?? 0);
      return {
        productId: r.productId,
        name: r.name,
        sku: r.sku,
        quantity: qty,
        stockValue: qty * Number(r.costPrice ?? 0),
      };
    });
    return empty;
  }

  // expense — next 30 days if future dates exist, else last 14 days
  const futureEnd = new Date(today);
  futureEnd.setDate(futureEnd.getDate() + 30);
  const pastStart = new Date(today);
  pastStart.setDate(pastStart.getDate() - 14);

  const expRows = await db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      expenseDate: expenses.expenseDate,
      status: expenses.status,
      paidTo: expenses.paidTo,
      category: expenseCategories.name,
    })
    .from(expenses)
    .leftJoin(
      expenseCategories,
      eq(expenses.categoryId, expenseCategories.id),
    )
    .where(
      and(
        eq(expenses.businessId, businessId),
        gte(expenses.expenseDate, pastStart),
        lt(expenses.expenseDate, futureEnd),
      ),
    )
    .orderBy(asc(expenses.expenseDate))
    .limit(50)
    .catch(() => []);

  empty.expenses = expRows.map((r) => {
    const d = toDate(r.expenseDate);
    return {
      id: r.id,
      description: r.description,
      category: r.category ?? "Expense",
      amount: Number(r.amount ?? 0),
      expenseDate: d.toISOString().slice(0, 10),
      status: String(r.status ?? ""),
      paidTo: r.paidTo,
    };
  });
  return empty;
}

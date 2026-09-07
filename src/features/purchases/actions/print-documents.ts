"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { products } from "@/db/schema/inventory/products";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { formatDateTimeNairobi, formatDateNairobi } from "@/lib/timezone";
import { purchasesQueryService } from "../services";

/** Accept any of several purchase-related view permissions. */
async function requirePurchaseDocUser() {
  const codes = [
    "goods_receipts.view",
    "goods_receipts.create",
    "goods_receipts.print",
    "purchase_orders.view",
    "purchase_orders.print",
  ] as const;
  let lastErr: unknown;
  for (const code of codes) {
    try {
      return await requireAuthorizedUser(code);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Missing permission to view purchase documents.");
}


async function businessLetterhead(businessId: string) {
  const [b] = await db
    .select({
      name: businesses.name,
      legalName: businesses.legalName,
      phone: businesses.phone,
      address: businesses.address,
      email: businesses.email,
      logo: businesses.logo,
    })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  return b ?? null;
}

export async function getPurchaseOrderPrintDataAction(purchaseOrderId: string) {
  try {
    const user = await requirePurchaseDocUser();
    const po = await purchasesQueryService.getPurchaseOrder(purchaseOrderId);
    if (!po || po.businessId !== user.businessId) {
      return { success: false as const, message: "Purchase order not found." };
    }

    const biz = await businessLetterhead(user.businessId);
    const productRows = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
      })
      .from(products)
      .where(eq(products.businessId, user.businessId));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    const lines = (po.items ?? []).map(
      (item: {
        productId: string;
        quantity: string | number;
        unitCost: string | number;
        total?: string | number | null;
      }) => {
        const p = productMap.get(item.productId);
        const qty = Number(item.quantity);
        const cost = Number(item.unitCost);
        const lineTotal =
          item.total != null ? Number(item.total) : qty * cost;
        return {
          sku: p?.sku ?? "—",
          name: p?.name ?? "Product",
          quantity: qty,
          unitCost: cost,
          lineTotal,
        };
      },
    );

    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

    return {
      success: true as const,
      data: {
        documentTitle: "Purchase Order",
        orderNumber: po.orderNumber,
        status: String(po.status),
        orderedAt: po.orderedAt
          ? formatDateTimeNairobi(po.orderedAt)
          : formatDateTimeNairobi(po.createdAt),
        notes: po.notes ?? null,
        supplier: {
          name: po.supplier?.name ?? "Supplier",
          phone: po.supplier?.phone ?? null,
          email: po.supplier?.email ?? null,
          address: po.supplier?.address ?? null,
        },
        business: {
          name: biz?.legalName || biz?.name || "Business",
          phone: biz?.phone ?? null,
          email: biz?.email ?? null,
          address: biz?.address ?? null,
          logo: biz?.logo ?? null,
        },
        lines,
        subtotal,
        tax: Number(po.tax ?? 0),
        total: Number(po.total ?? subtotal),
      },
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load purchase order.",
    };
  }
}

export async function getGoodsReceiptPrintDataAction(goodsReceiptId: string) {
  try {
    const user = await requirePurchaseDocUser();
    const grn = await purchasesQueryService.getGoodsReceipt(goodsReceiptId);
    if (!grn || grn.businessId !== user.businessId) {
      return { success: false as const, message: "Goods receipt not found." };
    }

    const biz = await businessLetterhead(user.businessId);
    const productRows = await db
      .select({ id: products.id, name: products.name, sku: products.sku })
      .from(products)
      .where(eq(products.businessId, user.businessId));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    const lines = (grn.items ?? []).map(
      (item: {
        productId: string;
        quantity: string | number;
        unitCost?: string | number | null;
      }) => {
        const p = productMap.get(item.productId);
        const qty = Number(item.quantity);
        const cost = Number(item.unitCost ?? 0);
        return {
          sku: p?.sku ?? "—",
          name: p?.name ?? "—",
          quantity: qty,
          unitCost: cost,
          lineTotal: qty * cost,
        };
      },
    );
    const total = lines.reduce((s, l) => s + l.lineTotal, 0);

    return {
      success: true as const,
      data: {
        documentTitle: "Goods Received Note",
        receiptNumber:
          (grn as { receiptNumber?: string }).receiptNumber ??
          grn.id.slice(0, 8),
        receivedAt: (grn as { receivedAt?: Date | string | null }).receivedAt
          ? formatDateTimeNairobi(
              (grn as { receivedAt: Date | string }).receivedAt,
            )
          : formatDateTimeNairobi(grn.createdAt),
        notes: grn.notes ?? null,
        supplierName: grn.supplier?.name ?? "—",
        business: {
          name: biz?.legalName || biz?.name || "Business",
          phone: biz?.phone ?? null,
          email: biz?.email ?? null,
          address: biz?.address ?? null,
          logo: biz?.logo ?? null,
        },
        lines,
        total,
      },
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load GRN.",
    };
  }
}

export async function getSupplierInvoicePrintDataAction(invoiceId: string) {
  try {
    const user = await requirePurchaseDocUser();
    const [row] = await db
      .select()
      .from(supplierInvoices)
      .where(eq(supplierInvoices.id, invoiceId))
      .limit(1);

    if (!row || row.businessId !== user.businessId) {
      return { success: false as const, message: "Supplier invoice not found." };
    }

    const biz = await businessLetterhead(user.businessId);

    return {
      success: true as const,
      data: {
        documentTitle: "Supplier Invoice / AP Bill",
        invoiceNumber: row.invoiceNumber,
        invoiceDate: row.invoiceDate
          ? formatDateNairobi(row.invoiceDate)
          : "—",
        dueDate: row.dueDate ? formatDateNairobi(row.dueDate) : null,
        status: String(row.status ?? "—"),
        total: Number(row.total ?? 0),
        amountPaid: Number(row.amountPaid ?? 0),
        balanceDue: Number(
          row.balanceDue ??
            Number(row.total ?? 0) - Number(row.amountPaid ?? 0),
        ),
        notes: row.notes ?? null,
        business: {
          name: biz?.legalName || biz?.name || "Business",
          phone: biz?.phone ?? null,
          email: biz?.email ?? null,
          address: biz?.address ?? null,
          logo: biz?.logo ?? null,
        },
      },
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load invoice.",
    };
  }
}

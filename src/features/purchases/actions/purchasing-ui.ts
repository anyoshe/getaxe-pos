"use server";

import { numberingSequencesService } from "@/features/settings/services/numbering-sequences.service";

import { journalPostingService } from "@/features/finance/services/journal-posting.service";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { supplierInvoiceService } from "../services/supplier-invoice.service";
import { db } from "@/db";
import { purchaseOrders } from "@/db/schema/purchasing/purchase_orders";
import { purchaseOrderItems } from "@/db/schema/purchasing/purchase_order_items";
import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { purchaseOrderService } from "../services/purchase-order.service";
import { goodsReceiptService } from "../services/goods-receipt.service";
import { supplierReturnService } from "../services/supplier-return.service";
import { purchaseOrderRepository } from "@/repositories/purchasing/purchase-orders.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import {
  resolveToStock,
  costPerStockUnit,
} from "@/features/inventory/services/unit-conversion.service";
import { qtyStr } from "@/lib/quantity";

const lineSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0),
  unitId: z.uuid().nullable().optional(),
});

const createPoSchema = z.object({
  supplierId: z.uuid(),
  notes: z.string().nullable().optional(),
  items: z.array(lineSchema).min(1),
});

export async function createPurchaseOrderAction(input: unknown) {
  const user = await requireAuthorizedUser("purchase_orders.create");
  const parsed = createPoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the purchase order and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const orderNumber = await numberingSequencesService.nextDocumentNumber(
    user.businessId,
    "PURCHASE_ORDER",
    null,
  );

  let subtotal = 0;
  const items = [];

  for (const line of data.items) {
    let qty = line.quantity;
    let cost = line.unitCost;

    // Optional: convert purchase unit → stock qty for ordered quantity consistency with inventory
    try {
      const units = await productUnitRepository.listByProduct(
        user.businessId,
        line.productId,
      );
      if (units.length > 0 && line.unitId) {
        const resolved = resolveToStock({
          productUnits: units.map((u) => ({
            unitId: u.unitId,
            factorToStock: Number(u.factorToStock),
            isStockUnit: u.isStockUnit,
            allowPurchase: u.allowPurchase,
            active: u.active,
            validTo: u.validTo,
          })),
          unitId: line.unitId,
          quantityEntered: line.quantity,
          // Any product packaging unit may be used on a PO (box, strip, carton…)
          allowDecimals: true,
        });
        qty = resolved.quantityStock;
        cost = costPerStockUnit(line.unitCost, resolved.factorToStock);
      }
    } catch (err) {
      return {
        success: false as const,
        message: err instanceof Error ? err.message : "Unit conversion failed.",
      };
    }

    const lineTotal = qty * cost;
    subtotal += lineTotal;
    items.push({
      productId: line.productId,
      quantity: Math.round(qty) || qty,
      receivedQuantity: 0,
      unitCost: cost.toFixed(4),
      discount: "0",
      tax: "0",
      total: lineTotal.toFixed(2),
    });
  }

  try {
    const result = await purchaseOrderService.createPurchaseOrder({
      order: {
        businessId: user.businessId,
        supplierId: data.supplierId,
        orderNumber,
        status: "DRAFT",
        subtotal: subtotal.toFixed(2),
        discount: "0",
        tax: "0",
        total: subtotal.toFixed(2),
        notes: data.notes ?? null,
        orderedBy: user.id,
      },
      items: items.map((i) => ({
        ...i,
        purchaseOrderId: "", // filled by service
      })),
    });

    revalidatePath("/purchases/orders");
    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "CREATE",
      entity: "PURCHASE_ORDER",
      entityId: (result as { order: { id: string } }).order.id,
      description: `Purchase order ${orderNumber} created`,
    });
    return {
      success: true as const,
      message: `Purchase order ${orderNumber} created.`,
      orderId: (result as { order: { id: string } }).order.id,
      orderNumber,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to create purchase order.",
    };
  }
}

export async function approvePurchaseOrderAction(purchaseOrderId: string) {
  const user = await requireAuthorizedUser("purchase_orders.approve");
  try {
    await purchaseOrderService.approvePurchaseOrder({
      purchaseOrderId,
      approvedBy: user.id,
    });
    revalidatePath("/purchases/orders");
    revalidatePath("/purchases/receiving");
    return { success: true as const, message: "Purchase order approved." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Approve failed.",
    };
  }
}

export async function cancelPurchaseOrderAction(purchaseOrderId: string) {
  await requireAuthorizedUser("purchase_orders.update");
  try {
    await purchaseOrderService.cancelPurchaseOrder(purchaseOrderId);
    revalidatePath("/purchases/orders");
    return { success: true as const, message: "Purchase order cancelled." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Cancel failed.",
    };
  }
}

const receiveSchema = z.object({
  purchaseOrderId: z.uuid(),
  warehouseId: z.uuid(),
  supplierInvoiceNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.coerce.number().positive(),
        unitId: z.uuid().nullable().optional(),
        unitCost: z.coerce.number().min(0),
        batchNumber: z.string().nullable().optional(),
        expiryDate: z.string().nullable().optional(),
        manufactureDate: z.string().nullable().optional(),
      }),
    )
    .min(1),
});

/** Create GRN and post stock into inventory (purchase receive). */
export async function receivePurchaseOrderAction(input: unknown) {
  const user = await requireAuthorizedUser("goods_receipts.create");
  const parsed = receiveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the goods receipt and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const po = await purchaseOrderRepository.findById(data.purchaseOrderId);
  if (!po || po.businessId !== user.businessId) {
    return { success: false as const, message: "Purchase order not found." };
  }

  const blocked = new Set(["RECEIVED", "CANCELLED", "DRAFT", "CLOSED"]);
  if (blocked.has(String(po.status))) {
    return {
      success: false as const,
      message: `Purchase order is ${po.status} and cannot be received again.`,
    };
  }

  // Remaining qty per product (stock units on PO lines)
  const poLines = await db
    .select()
    .from(purchaseOrderItems)
    .where(eq(purchaseOrderItems.purchaseOrderId, data.purchaseOrderId));

  if (poLines.length === 0) {
    return { success: false as const, message: "Purchase order has no lines." };
  }

  const remainingByProduct = new Map<string, number>();
  for (const l of poLines) {
    const ordered = Number(l.quantity ?? 0);
    const received = Number(l.receivedQuantity ?? 0);
    const left = Math.max(0, ordered - received);
    remainingByProduct.set(
      l.productId,
      (remainingByProduct.get(l.productId) ?? 0) + left,
    );
  }

  const totalRemaining = [...remainingByProduct.values()].reduce((a, b) => a + b, 0);
  if (totalRemaining <= 1e-9) {
    // Harden: mark fully received so UI stops offering it
    await db
      .update(purchaseOrders)
      .set({ status: "RECEIVED", updatedAt: new Date() })
      .where(eq(purchaseOrders.id, data.purchaseOrderId));
    return {
      success: false as const,
      message:
        "This purchase order is already fully received. Nothing left to receive.",
    };
  }

  const receiptNumber = await numberingSequencesService.nextDocumentNumber(
    user.businessId,
    "GOODS_RECEIPT",
    null,
  );
  let subtotal = 0;
  const items = [];
  // Track how much of remaining we consume in this GRN (multi-line same product)
  const consuming = new Map<string, number>();

  for (const line of data.items) {
    let qty = line.quantity;
    let cost = line.unitCost;
    try {
      const units = await productUnitRepository.listByProduct(
        user.businessId,
        line.productId,
      );
      if (units.length > 0 && line.unitId) {
        const resolved = resolveToStock({
          productUnits: units.map((u) => ({
            unitId: u.unitId,
            factorToStock: Number(u.factorToStock),
            isStockUnit: u.isStockUnit,
            allowPurchase: u.allowPurchase,
            active: u.active,
            validTo: u.validTo,
          })),
          unitId: line.unitId,
          quantityEntered: line.quantity,
          allowDecimals: true,
        });
        qty = resolved.quantityStock;
        cost = costPerStockUnit(line.unitCost, resolved.factorToStock);
      }
    } catch (err) {
      return {
        success: false as const,
        message:
          err instanceof Error ? err.message : "Unit conversion failed on receive.",
      };
    }

    const already = consuming.get(line.productId) ?? 0;
    const left = remainingByProduct.get(line.productId) ?? 0;
    const available = left - already;
    if (qty > available + 1e-6) {
      return {
        success: false as const,
        message: `Cannot receive ${qty} stock unit(s) for this product — only ${Math.max(0, available)} remaining on the PO.`,
      };
    }
    if (qty <= 0) {
      return {
        success: false as const,
        message: "Receive quantity must be greater than zero.",
      };
    }
    consuming.set(line.productId, already + qty);

    const total = qty * cost;
    subtotal += total;
    items.push({
      productId: line.productId,
      quantity: Math.round(qty) || qty,
      unitCost: cost.toFixed(4),
      batchNumber: line.batchNumber?.trim() || null,
      expiryDate: line.expiryDate?.trim() || null,
      manufactureDate: line.manufactureDate?.trim() || null,
      total: total.toFixed(2),
    });
  }

  try {
    const result = await goodsReceiptService.receiveGoods({
      warehouseId: data.warehouseId,
      receipt: {
        businessId: user.businessId,
        purchaseOrderId: data.purchaseOrderId,
        supplierId: po.supplierId,
        receiptNumber,
        supplierInvoiceNumber: data.supplierInvoiceNumber ?? null,
        status: "POSTED",
        subtotal: subtotal.toFixed(2),
        tax: "0",
        total: subtotal.toFixed(2),
        receivedBy: user.id,
        notes: data.notes ?? null,
      },
      items: items.map((i) => ({
        ...i,
        goodsReceiptId: "",
      })) as never,
    });

    try {
      const amt = Number(
        (Array.isArray(data.items) ? data.items : []).reduce(
          (s: number, it: any) =>
            s + Number(it.quantity ?? 0) * Number(it.unitCost ?? it.costPrice ?? 0),
          0,
        ),
      );
      if (amt > 0) {
        const grnId =
          (result as { receipt?: { id?: string } })?.receipt?.id ??
          data.purchaseOrderId;
        await journalPostingService.postPurchaseReceive({
          businessId: user.businessId,
          sourceId: String(grnId),
          reference: receiptNumber,
          amount: amt,
          postedBy: user.id,
        });

        // Open AP bill so Finance → AP aging can be cleared by payment
        const invNo =
          (data.supplierInvoiceNumber && String(data.supplierInvoiceNumber).trim()) ||
          `AP-${receiptNumber}`;
        try {
          await supplierInvoiceService.create({
            businessId: user.businessId,
            supplierId: po.supplierId,
            purchaseOrderId: data.purchaseOrderId,
            invoiceNumber: invNo,
            total: amt,
            notes: `Auto from GRN ${receiptNumber}`,
            createdBy: user.id,
            skipJournal: true,
          });
        } catch (invErr) {
          console.error("[grn] supplier invoice", invErr);
        }
      }

      // Mark PO received when all lines fully received
      try {
        const lines = await db
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, data.purchaseOrderId));
        const allDone =
          lines.length > 0 &&
          lines.every(
            (l) => Number(l.receivedQuantity ?? 0) >= Number(l.quantity ?? 0) - 1e-9,
          );
        const anyRecv = lines.some((l) => Number(l.receivedQuantity ?? 0) > 0);
        await db
          .update(purchaseOrders)
          .set({
            status: allDone ? "RECEIVED" : anyRecv ? "PARTIALLY_RECEIVED" : "APPROVED",
            updatedAt: new Date(),
          })
          .where(eq(purchaseOrders.id, data.purchaseOrderId));
      } catch (poErr) {
        console.error("[grn] po status", poErr);
      }
    } catch (e) {
      console.error("[grn] journal", e);
    }
    revalidatePath("/purchases/receiving");
    revalidatePath("/purchases/orders");
    revalidatePath("/purchases/supplier-invoices");
    revalidatePath("/finance/ap-aging");
    revalidatePath("/finance/journals");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "CREATE",
      entity: "GOODS_RECEIPT",
      entityId: (result as { receipt?: { id: string } })?.receipt?.id,
      description: `Goods receipt ${receiptNumber} posted`,
    });

    return {
      success: true as const,
      message: `Goods receipt ${receiptNumber} posted to stock.`,
      receiptId: (result as { receipt?: { id: string } })?.receipt?.id,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to receive goods.",
    };
  }
}

const returnSchema = z.object({
  supplierId: z.uuid(),
  warehouseId: z.uuid(),
  notes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        batchId: z.uuid().nullable().optional(),
        quantity: z.coerce.number().positive(),
        unitCost: z.coerce.number().min(0).optional(),
      }),
    )
    .min(1),
});

export async function createSupplierReturnAction(input: unknown) {
  const user = await requireAuthorizedUser("supplier_returns.create");
  const parsed = returnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the supplier return and try again.",
    };
  }

  const data = parsed.data;
  const returnNumber = await numberingSequencesService.nextDocumentNumber(
    user.businessId,
    "SUPPLIER_RETURN",
    null,
  );

  try {
    // Prefer service API if present
    const svc = supplierReturnService as {
      createSupplierReturn?: (r: unknown) => Promise<unknown>;
      postSupplierReturn?: (r: unknown) => Promise<unknown>;
    };

    await supplierReturnService.create({
      supplierReturn: {
        businessId: user.businessId,
        supplierId: data.supplierId,
        returnNumber,
        reason: "OTHER",
        createdBy: user.id,
      },
      items: data.items.map((i) => ({
        productId: i.productId,
        quantity: Math.round(i.quantity),
        warehouseId: data.warehouseId,
        productBatchId: i.batchId ?? null,
        unitCost: (i.unitCost ?? 0).toFixed(2),
        total: ((i.unitCost ?? 0) * i.quantity).toFixed(2),
      })) as never,
    });

    revalidatePath("/purchases/returns");
    revalidatePath("/inventory/stock");
    return {
      success: true as const,
      message: `Supplier return ${returnNumber} recorded.`,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Supplier return failed.",
    };
  }
}

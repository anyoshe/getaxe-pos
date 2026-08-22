"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productRepository } from "@/repositories/inventory/products.repository";
import { productSerialRepository } from "@/repositories/inventory/product-serials.repository";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { salesService } from "../services";
import { salesQueryService } from "../services/sales-query.service";
import {
  decodeSerialMap,
  encodeSerialMap,
} from "../utils/document-serials";

const lineSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0),
  serialNumbers: z.array(z.string()).optional().default([]),
});

const schema = z.object({
  documentType: z.enum(["quotation", "order"]),
  warehouseId: z.uuid(),
  branchId: z.uuid(),
  customerId: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(lineSchema).min(1),
});

/**
 * Create quotation (QUO-*) or sales order (SO-*) as DRAFT.
 * Serialized products must include serials — reserved until convert or cancel.
 */
export async function createSalesDocumentAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Add at least one product and check the form.",
    };
  }

  const data = parsed.data;
  const prefix = data.documentType === "quotation" ? "QUO" : "SO";
  const docLabel =
    data.documentType === "quotation" ? "Quotation" : "Sales order";

  try {
    const lines = [];
    const serialMap: Record<string, string[]> = {};
    const allSerials: string[] = [];

    for (const line of data.items) {
      const product = await productRepository.findById(
        line.productId,
        user.businessId,
      );
      if (!product) {
        return { success: false as const, message: "Product not found." };
      }

      const serials = (line.serialNumbers ?? [])
        .map((s) => s.trim())
        .filter(Boolean);

      if (product.serialized) {
        if (serials.length !== line.quantity) {
          return {
            success: false as const,
            message: `${product.name} is serialized — select exactly ${line.quantity} serial number(s).`,
          };
        }
        if (new Set(serials).size !== serials.length) {
          return {
            success: false as const,
            message: `Duplicate serials on ${product.name}.`,
          };
        }
        serialMap[line.productId] = serials;
        allSerials.push(...serials);
      }

      const lineTotal = line.quantity * line.unitPrice;
      lines.push({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice.toFixed(2),
        discount: "0",
        tax: "0",
        total: lineTotal.toFixed(2),
        skipStock: true,
        serialNumbers: [] as string[],
      });
    }

    if (new Set(allSerials).size !== allSerials.length) {
      return {
        success: false as const,
        message: "The same serial appears on more than one line.",
      };
    }

    const subtotal = lines.reduce((s, l) => s + Number(l.total), 0);
    const invoiceNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

    const notePrefix =
      data.documentType === "quotation" ? "[QUOTATION]" : "[SALES_ORDER]";
    const serialNote =
      Object.keys(serialMap).length > 0 ? encodeSerialMap(serialMap) : "";
    const notes = [notePrefix, data.notes, serialNote].filter(Boolean).join(" ");

    // Reserve serials before creating document
    if (allSerials.length > 0) {
      await productSerialRepository.markReserved(
        user.businessId,
        allSerials,
        invoiceNumber,
      );
    }

    try {
      const result = await salesService.createSale({
        sale: {
          businessId: user.businessId,
          branchId: data.branchId,
          warehouseId: data.warehouseId,
          customerId: data.customerId ?? null,
          invoiceNumber,
          status: "DRAFT",
          subtotal: subtotal.toFixed(2),
          discount: "0",
          tax: "0",
          total: subtotal.toFixed(2),
          amountPaid: "0",
          balanceDue: subtotal.toFixed(2),
          paymentStatus: "PENDING",
          notes,
          soldBy: user.id,
        },
        items: lines.map((l) => ({
          businessId: user.businessId,
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount,
          tax: l.tax,
          total: l.total,
          skipStock: true,
          serialNumbers: [],
        })),
        payments: [],
      });

      revalidatePath("/sales/quotations");
      revalidatePath("/sales/orders");

      return {
        success: true as const,
        message: `${docLabel} ${result.sale.invoiceNumber} saved${
          allSerials.length ? ` (${allSerials.length} serials reserved)` : ""
        }.`,
        id: result.sale.id,
        invoiceNumber: result.sale.invoiceNumber,
        documentType: data.documentType,
      };
    } catch (err) {
      // roll back reservations if sale create fails
      if (allSerials.length > 0) {
        await productSerialRepository.releaseReserved(
          user.businessId,
          allSerials,
        );
      }
      throw err;
    }
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : `Failed to save ${docLabel}.`,
    };
  }
}

/**
 * Convert DRAFT quotation/order → completed sale (stock + reserved serials → SOLD).
 */
export async function convertDocumentToSaleAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = z
    .object({
      saleId: z.uuid(),
      paymentMethod: z
        .enum(["CASH", "MPESA", "CARD", "MOBILE_MONEY", "CREDIT"])
        .default("CASH"),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid document." };
  }

  const detail = await salesQueryService.getSaleDetail(
    user.businessId,
    parsed.data.saleId,
  );

  if (!detail || detail.sale.status !== "DRAFT") {
    return {
      success: false as const,
      message: "Only draft quotations/orders can be converted.",
    };
  }

  const serialMap = decodeSerialMap(detail.sale.notes);

  try {
    const { createSaleAction } = await import("./create-sale");
    const result = await createSaleAction({
      warehouseId: detail.sale.warehouseId,
      branchId: detail.sale.branchId,
      customerId: detail.sale.customerId,
      notes: `Converted from ${detail.sale.invoiceNumber}`,
      paymentMethod: parsed.data.paymentMethod,
      items: detail.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        serialNumbers: serialMap[i.productId] ?? [],
      })),
    });

    if (!result.success) return result;

    await saleRepository.update(detail.sale.id, {
      status: "VOIDED",
      notes: `${detail.sale.notes ?? ""} → converted to ${result.invoiceNumber}`,
    });

    revalidatePath("/sales/quotations");
    revalidatePath("/sales/orders");
    revalidatePath("/sales/invoices");
    revalidatePath("/inventory/stock");

    return {
      success: true as const,
      message: `Converted to sale ${result.invoiceNumber}.`,
      saleId: result.saleId,
      invoiceNumber: result.invoiceNumber,
    };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Conversion failed.",
    };
  }
}

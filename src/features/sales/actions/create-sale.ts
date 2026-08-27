"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { nowNairobiWallClock } from "@/lib/timezone";
import { productRepository } from "@/repositories/inventory/products.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { resolveToStock } from "@/features/inventory/services/unit-conversion.service";
import { salesService } from "../services";

const lineSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().positive(),
  /** Sales unit; omit for stock unit (factor 1). */
  unitId: z.uuid().optional().nullable(),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).optional().default(0),
  serialNumbers: z.array(z.string()).optional().default([]),
});

const schema = z.object({
  warehouseId: z.uuid(),
  branchId: z.uuid(),
  customerId: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentMethod: z
    .enum([
      "CASH",
      "MPESA",
      "CARD",
      "BANK_TRANSFER",
      "MOBILE_MONEY",
      "CREDIT",
    ])
    .default("CASH"),
  items: z.array(lineSchema).min(1),
});

export async function createSaleAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the sale and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const lines = [];

    for (const line of data.items) {
      const product = await productRepository.findById(
        line.productId,
        user.businessId,
      );

      if (!product) {
        return {
          success: false as const,
          message: `Product not found: ${line.productId}`,
        };
      }

      let quantityStock = Math.round(Number(line.quantity));
      let quantityEntered = Number(line.quantity);
      let conversionFactor = 1;
      let lineUnitId: string | null = line.unitId ?? product.salesUnitId ?? product.stockUnitId ?? null;

      try {
        const productUnits = await productUnitRepository.listByProduct(
          user.businessId,
          line.productId,
        );
        if (productUnits.length > 0) {
          const resolved = resolveToStock({
            productUnits: productUnits.map((u) => ({
              unitId: u.unitId,
              factorToStock: Number(u.factorToStock),
              isStockUnit: u.isStockUnit,
              allowSale: u.allowSale,
              allowPurchase: u.allowPurchase,
              active: u.active,
              validTo: u.validTo,
            })),
            unitId: line.unitId ?? product.salesUnitId ?? undefined,
            quantityEntered: Number(line.quantity),
            requireSale: true,
            allowDecimals: true,
          });
          quantityStock = resolved.quantityStock;
          quantityEntered = resolved.quantityEntered;
          conversionFactor = resolved.factorToStock;
          lineUnitId = resolved.unitId;
        }
      } catch (err) {
        return {
          success: false as const,
          message:
            err instanceof Error
              ? err.message
              : "Unit conversion failed for a sale line.",
        };
      }

      if (product.serialized) {
        const serials = (line.serialNumbers ?? [])
          .map((s) => s.trim())
          .filter(Boolean);
        if (serials.length !== quantityStock) {
          return {
            success: false as const,
            message: `${product.name} is serialized — enter ${quantityStock} serial number(s) (stock units).`,
          };
        }
        if (conversionFactor !== 1) {
          return {
            success: false as const,
            message: `${product.name}: serialized products must sell in stock units (factor 1).`,
          };
        }
      }

      const discount = line.discount ?? 0;
      const lineTotal = quantityEntered * line.unitPrice - discount;

      lines.push({
        productId: line.productId,
        quantity: quantityStock,
        unitId: lineUnitId,
        quantityEntered,
        quantityStock,
        conversionFactor,
        unitPrice: line.unitPrice.toFixed(2),
        discount: discount.toFixed(2),
        tax: "0",
        total: lineTotal.toFixed(2),
        serialNumbers: product.serialized
          ? (line.serialNumbers ?? []).map((s) => s.trim()).filter(Boolean)
          : [],
        skipStock: !product.trackInventory || product.productType === "service",
      });
    }

    const subtotal = lines.reduce((s, l) => s + Number(l.total), 0);
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    const result = await salesService.createSale({
      sale: {
        businessId: user.businessId,
        branchId: data.branchId,
        warehouseId: data.warehouseId,
        customerId: data.customerId ?? null,
        invoiceNumber,
        status: "COMPLETED",
        subtotal: subtotal.toFixed(2),
        discount: "0",
        tax: "0",
        total: subtotal.toFixed(2),
        amountPaid: subtotal.toFixed(2),
        balanceDue: "0",
        paymentStatus: "COMPLETED",
        notes: data.notes ?? null,
        soldBy: user.id,
        soldAt: nowNairobiWallClock(),
      },
      items: lines.map((l) => ({
        businessId: user.businessId,
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
        tax: l.tax,
        total: l.total,
        serialNumbers: l.serialNumbers,
        skipStock: l.skipStock,
      })),
      payments: [], // ledger optional — sale.amountPaid / paymentStatus already set
    });

    revalidatePath("/sales");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");

    return {
      success: true as const,
      message: `Sale ${result.sale.invoiceNumber} completed.`,
      saleId: result.sale.id,
      invoiceNumber: result.sale.invoiceNumber,
      total: result.sale.total,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to complete sale.",
    };
  }
}

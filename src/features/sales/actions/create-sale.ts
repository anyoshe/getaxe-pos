"use server";

import { numberingSequencesService } from "@/features/settings/services/numbering-sequences.service";

import { financeService } from "@/features/finance/services/finance.service";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { journalPostingService } from "@/features/finance/services/journal-posting.service";
import { loyaltyService } from "@/features/sales/services/loyalty.service";
import { db } from "@/db";
import { customers } from "@/db/schema/sales/customers";
import { sales } from "@/db/schema/sales/sales";
import { and, eq, sql } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { formatDateTimeNairobi, nowNairobiWallClock } from "@/lib/timezone";
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
  preferredBatchIds: z.array(z.uuid()).optional().default([]),
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
        // Build unit matrix; always allow product stock/sales unit FKs at factor 1
        // even when packaging rows were never saved (POS still offers those units).
        const matrix: {
          unitId: string;
          factorToStock: number;
          isStockUnit: boolean;
          allowSale: boolean;
          allowPurchase: boolean;
          active: boolean;
          validTo: Date | string | null;
        }[] = productUnits.map((u) => ({
          unitId: u.unitId,
          factorToStock: Number(u.factorToStock),
          isStockUnit: Boolean(u.isStockUnit),
          allowSale: u.allowSale !== false,
          allowPurchase: u.allowPurchase !== false,
          active: u.active !== false,
          validTo: u.validTo,
        }));

        const ensureUnit = (
          unitId: string | null | undefined,
          flags: { isStockUnit?: boolean },
        ) => {
          if (!unitId) return;
          if (matrix.some((u) => u.unitId === unitId)) return;
          matrix.push({
            unitId,
            factorToStock: 1,
            isStockUnit: Boolean(flags.isStockUnit),
            allowSale: true,
            allowPurchase: true,
            active: true,
            validTo: null,
          });
        };
        ensureUnit(product.stockUnitId, { isStockUnit: true });
        ensureUnit(product.salesUnitId, { isStockUnit: false });
        // POS may send the line unit even when packaging is incomplete
        ensureUnit(line.unitId, { isStockUnit: false });

        const requestedUnit =
          line.unitId ?? product.salesUnitId ?? product.stockUnitId ?? null;

        if (matrix.length > 0) {
          try {
            const resolved = resolveToStock({
              productUnits: matrix,
              unitId: requestedUnit,
              quantityEntered: Number(line.quantity),
              allowDecimals: true,
            });
            quantityStock = resolved.quantityStock;
            quantityEntered = resolved.quantityEntered;
            conversionFactor = resolved.factorToStock;
            lineUnitId = resolved.unitId;
          } catch {
            // Last resort: sell in stock units (qty as entered, factor 1)
            const stockId = product.stockUnitId ?? requestedUnit;
            quantityEntered = Number(line.quantity);
            quantityStock = quantityEntered;
            conversionFactor = 1;
            lineUnitId = stockId;
          }
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
        preferredBatchIds: line.preferredBatchIds ?? [],
      });
    }

    const subtotal = lines.reduce((s, l) => s + Number(l.total), 0);
    const isCredit = data.paymentMethod === "CREDIT";

    if (isCredit) {
      if (!data.customerId) {
        return {
          success: false as const,
          message:
            "Credit invoice requires a registered customer account. Look up or create the customer before invoicing.",
        };
      }
      // Ensure customer exists and belongs to this business
      const [cust] = await db
        .select({
          id: customers.id,
          active: customers.active,
          allowCredit: customers.allowCredit,
          creditLimit: customers.creditLimit,
          customerType: customers.customerType,
          companyName: customers.companyName,
          firstName: customers.firstName,
          lastName: customers.lastName,
          phone: customers.phone,
        })
        .from(customers)
        .where(eq(customers.id, data.customerId))
        .limit(1);
      if (!cust || cust.active === false) {
        return {
          success: false as const,
          message:
            "Customer account not found or inactive. Open a customer account before selling on credit.",
        };
      }
      if (!cust.allowCredit) {
        return {
          success: false as const,
          message:
            "This customer is not enabled for credit. Under Customers, enable credit account and complete KYC.",
        };
      }
      const [bal] = await db
        .select({
          open: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, user.businessId),
            eq(sales.customerId, data.customerId),
            sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
          ),
        );
      const openBalance = Number(bal?.open ?? 0);
      const limit = Number(cust.creditLimit ?? 0);
      if (limit > 0 && openBalance + subtotal > limit + 0.001) {
        return {
          success: false as const,
          message: `Credit limit exceeded. Limit KES ${limit.toLocaleString()}, open balance KES ${openBalance.toLocaleString()}, this sale KES ${subtotal.toLocaleString()}. Available KES ${Math.max(0, limit - openBalance).toLocaleString()}.`,
        };
      }
    }

    const invoiceNumber = await numberingSequencesService.nextDocumentNumber(
      user.businessId,
      isCredit ? "SALE" : "CASH_SALE",
      data.branchId ?? null,
    );

    const defaultCash = await financeService
      .getDefaultCashAccount(user.businessId)
      .catch(() => null);

    const result = (await salesService.createSale({
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
        amountPaid: isCredit ? "0" : subtotal.toFixed(2),
        balanceDue: isCredit ? subtotal.toFixed(2) : "0",
        paymentStatus: isCredit ? "PENDING" : "COMPLETED",
        notes: data.notes ?? null,
        soldBy: user.id,
        soldAt: nowNairobiWallClock(),
      },
      items: lines.map((l) => ({
        businessId: user.businessId,
        productId: l.productId,
        quantity: l.quantity,
        unitId: (l as { unitId?: string | null }).unitId ?? null,
        quantityEntered:
          (l as { quantityEntered?: number }).quantityEntered != null
            ? String((l as { quantityEntered?: number }).quantityEntered)
            : null,
        quantityStock: Number(
          (l as { quantityStock?: number }).quantityStock ?? l.quantity,
        ),
        conversionFactor:
          (l as { conversionFactor?: number }).conversionFactor != null
            ? String((l as { conversionFactor?: number }).conversionFactor)
            : null,
        unitPrice: l.unitPrice,
        discount: l.discount,
        tax: l.tax,
        total: l.total,
        serialNumbers: l.serialNumbers,
        skipStock: l.skipStock,
        preferredBatchIds: (l as { preferredBatchIds?: string[] })
          .preferredBatchIds,
      })),
      payments: isCredit
        ? []
        : [
            {
              businessId: user.businessId,
              saleId: "",
              cashAccountId: defaultCash?.id ?? null,
              method: data.paymentMethod,
              status: "COMPLETED",
              amount: subtotal.toFixed(2),
              transactionReference: null,
              receivedBy: user.id,
            },
          ],
    }));

    revalidatePath("/sales");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/finance/payments");


    // Double-entry journal (non-blocking)
    try {
      const totalNum = Number((result as any).sale?.total ?? subtotal);
      await journalPostingService.postSale({
        businessId: user.businessId,
        saleId: (result as any).sale.id,
        invoiceNumber: String((result as any).sale.invoiceNumber),
        total: totalNum,
        postedBy: user.id,
        isCredit,
      });
    } catch (e) {
      console.error("[create-sale] journal", e);
    }

    // Loyalty earn via program rules + ledger
    try {
      const customerId = data.customerId as string | null | undefined;
      const totalNum = Number((result as any).sale?.total ?? subtotal);
      if (customerId && totalNum > 0) {
        await loyaltyService.earnFromSale({
          businessId: user.businessId,
          customerId,
          saleTotal: totalNum,
          saleId: (result as any).sale.id,
          invoiceNumber: String((result as any).sale.invoiceNumber),
          createdBy: user.id,
        });
      }
    } catch (e) {
      console.error("[create-sale] loyalty", e);
    }
    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "CREATE",
      entity: "SALE",
      entityId: (result as any).sale?.id,
      description: `${isCredit ? "Credit invoice" : "Cash sale"} ${(result as any).sale?.invoiceNumber} total ${(result as any).sale?.total}`,
    });

    
    let customerSnap: {
      displayName: string | null;
      contactName: string | null;
      phone: string | null;
      isBusiness: boolean;
    } = { displayName: null, contactName: null, phone: null, isBusiness: false };
    if (data.customerId) {
      const [c] = await db
        .select({
          customerType: customers.customerType,
          companyName: customers.companyName,
          firstName: customers.firstName,
          lastName: customers.lastName,
          phone: customers.phone,
        })
        .from(customers)
        .where(eq(customers.id, data.customerId))
        .limit(1);
      if (c) {
        const isBiz = c.customerType === "BUSINESS";
        const person = [c.firstName, c.lastName].filter(Boolean).join(" ");
        customerSnap = {
          isBusiness: isBiz,
          displayName: isBiz && c.companyName ? c.companyName : person || c.companyName,
          contactName: isBiz ? person || null : null,
          phone: c.phone,
        };
      }
    }

    const sale = (result as any).sale;
    return {
      success: true as const,
      message: `${isCredit ? "Credit invoice" : "Cash sale"} ${sale.invoiceNumber} completed.`,
      saleId: sale.id,
      invoiceNumber: String(sale.invoiceNumber),
      total: Number(sale.total ?? subtotal),
      subtotal: Number(sale.subtotal ?? subtotal),
      amountPaid: Number(sale.amountPaid ?? (isCredit ? 0 : subtotal)),
      balanceDue: Number(sale.balanceDue ?? (isCredit ? subtotal : 0)),
      paymentMethod: data.paymentMethod,
      isCredit,
      soldAt: sale.soldAt
        ? formatDateTimeNairobi(sale.soldAt)
        : formatDateTimeNairobi(nowNairobiWallClock()),
      customerId: data.customerId ?? null,
      customerDisplayName: customerSnap.displayName,
      customerContactName: customerSnap.contactName,
      customerPhone: customerSnap.phone,
      customerIsBusiness: customerSnap.isBusiness,
      notes: data.notes ?? null,
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: Number(
          (l as { quantityEntered?: number }).quantityEntered ?? l.quantity,
        ),
        unitPrice: Number(l.unitPrice),
        total: Number(l.total),
        unitId: (l as { unitId?: string | null }).unitId ?? null,
      })),
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to complete sale.",
    };
  }
}

import { z } from "zod";

export const receiveStockSchema = z.object({
  productId: z.uuid("Select a product"),
  warehouseId: z.uuid("Select a warehouse"),
  /** Quantity in the entered unit (purchase unit by default). */
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  /** Unit of the quantity above; omit to use product purchase/stock unit. */
  unitId: z.uuid().nullable().optional(),
  unitCost: z.coerce.number().min(0).nullable().optional(),
  movementType: z.enum(["OPENING_STOCK", "PURCHASE", "ADJUSTMENT"]).default("PURCHASE"),
  reference: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  batchNumber: z.string().trim().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  manufactureDate: z.string().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
  /** One serial per stock unit when product.serialized is true */
  serialNumbers: z.array(z.string().trim().min(1)).optional().default([]),
});

export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;

import { z } from "zod";

export const receiveStockSchema = z.object({
  productId: z.uuid("Select a product"),
  warehouseId: z.uuid("Select a warehouse"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
  unitCost: z.coerce.number().min(0).nullable().optional(),
  movementType: z.enum(["OPENING_STOCK", "PURCHASE", "ADJUSTMENT"]).default("PURCHASE"),
  reference: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  // Required when product.trackBatch
  batchNumber: z.string().trim().nullable().optional(),
  // Required when product.trackExpiry
  expiryDate: z.string().nullable().optional(),
  manufactureDate: z.string().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
});

export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;

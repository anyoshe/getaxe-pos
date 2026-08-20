import { z } from "zod";

export const receiveStockSchema = z.object({
  productId: z.uuid("Select a product"),
  warehouseId: z.uuid("Select a warehouse"),
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),

  unitCost: z.coerce.number().min(0).nullable().optional(),

  movementType: z
    .enum(["OPENING_STOCK", "PURCHASE", "ADJUSTMENT"])
    .default("PURCHASE"),

  reference: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),

  batchNumber: z.string().trim().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  manufactureDate: z.string().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),

  serialNumbers: z.array(
    z.string().trim().min(1, "Serial number cannot be empty"),
  ).optional(),
});

export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;
import { z } from "zod";

export const createProductBatchSchema = z.object({
  businessId: z.uuid(),

  productId: z.uuid(),

  supplierId: z.uuid().nullable().optional(),

  batchNumber: z
    .string()
    .trim()
    .min(1, "Batch number is required."),

  manufactureDate: z
    .string()
    .nullable()
    .optional(),

  expiryDate: z
    .string()
    .nullable()
    .optional(),

  purchaseInvoice: z
    .string()
    .trim()
    .nullable()
    .optional(),

  costPrice: z.coerce
    .number()
    .min(0, "Cost price cannot be negative."),

  sellingPrice: z.coerce
    .number()
    .min(0)
    .nullable()
    .optional(),

  quantityReceived: z.coerce
    .number()
    .int()
    .positive(),

  quantityRemaining: z.coerce
    .number()
    .int()
    .min(0),

  active: z.boolean(),
});

export type CreateProductBatchInput =
  z.infer<
    typeof createProductBatchSchema
  >;
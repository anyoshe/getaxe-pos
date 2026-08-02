import { z } from "zod";


export const createProductSchema = z.object({

  categoryId: z.string().uuid(),

  supplierId: z.string().uuid()
    .optional()
    .nullable(),

  manufacturerId: z.string().uuid()
    .optional()
    .nullable(),

  name: z.string()
    .min(2, "Product name is required"),

  genericName: z.string()
    .optional()
    .nullable(),

  productBrand: z.string()
    .optional()
    .nullable(),

  description: z.string()
    .optional()
    .nullable(),

  sku: z.string()
    .optional()
    .nullable(),

  barcode: z.string()
    .optional()
    .nullable(),

  packSize: z.string()
    .optional()
    .nullable(),

  // costPrice: z.string()
  //   .optional()
  //   .nullable(),
  costPrice: z.number().optional().nullable(),

  trackInventory: z.boolean()
    .default(true),

  trackBatch: z.boolean()
    .default(false),

  trackExpiry: z.boolean()
    .default(false),

  serialized: z.boolean()
    .default(false),

  allowNegativeStock: z.boolean()
    .default(false),

  minimumStock: z.number()
    .int()
    .default(0),

  reorderLevel: z.number()
    .int()
    .default(0),

});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;
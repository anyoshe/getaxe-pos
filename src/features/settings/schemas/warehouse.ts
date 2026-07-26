import { z } from "zod";

export const createWarehouseSchema = z.object({
  businessId: z.uuid(),

  branchId: z.uuid(),

  code: z
    .string()
    .trim()
    .min(2, "Warehouse code is required.")
    .max(20),

  name: z
    .string()
    .trim()
    .min(2, "Warehouse name is required.")
    .max(100),

  description: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable(),

  active: z.boolean().default(true),
});

export const updateWarehouseSchema =
  createWarehouseSchema
    .omit({
      businessId: true,
    })
    .partial();

export type CreateWarehouseInput =
  z.infer<typeof createWarehouseSchema>;

export type UpdateWarehouseInput =
  z.infer<typeof updateWarehouseSchema>;
import { z } from "zod";
import { stockMovementTypeEnum } from "@/db/schema/shared";



export const createStockMovementSchema = z.object({
  businessId: z.uuid(),

  productId: z.uuid(),

  batchId: z
    .uuid()
    .nullable()
    .optional(),

  warehouseId: z.uuid(),

  userId: z
    .uuid()
    .nullable()
    .optional(),

  movementType: z.enum(
  stockMovementTypeEnum.enumValues
),

  quantity: z.coerce
    .number()
    .int()
    .refine(
      (value) => value !== 0,
      {
        message:
          "Quantity cannot be zero.",
      }
    ),

  unitCost: z.coerce
    .number()
    .min(0)
    .nullable()
    .optional(),

  reference: z
    .string()
    .trim()
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),
});

export type CreateStockMovementInput =
  z.infer<
    typeof createStockMovementSchema
  >;
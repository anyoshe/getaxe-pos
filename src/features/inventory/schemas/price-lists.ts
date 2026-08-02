import { z } from "zod";

export const createPriceListSchema = z.object({
  businessId: z.uuid(),

  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(50),

  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(255),

  description: z
    .string()
    .nullable()
    .optional(),

  isDefault: z.boolean(),

  active: z.boolean(),
});

export type CreatePriceListInput =
  z.infer<
    typeof createPriceListSchema
  >;
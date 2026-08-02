import { z } from "zod";

export const createCategorySchema = z.object({
  businessId: z.string().uuid(),

  name: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(100),

  description: z
    .string()
    .nullable()
    .optional(),

  active: z.boolean(),
});

export type CreateCategoryInput =
  z.infer<typeof createCategorySchema>;
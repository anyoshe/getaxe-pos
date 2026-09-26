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
    .trim()
    .nullable()
    .optional(),

  markupPercent: z.coerce
    .number()
    .min(0)
    .max(1000)
    .nullable()
    .optional(),

  active: z.boolean(),
});

export type CreateCategoryInput =
  z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(100),

  description: z
    .string()
    .trim()
    .nullable()
    .optional(),

  markupPercent: z.coerce
    .number()
    .min(0)
    .max(1000)
    .nullable()
    .optional(),

  active: z.boolean(),
});

export type UpdateCategoryInput =
  z.infer<typeof updateCategorySchema>;
import { z } from "zod";


export const createUnitSchema = z.object({
  businessId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  code: z
    .string()
    .min(1, "Unit code is required.")
    .max(50)
    .trim(),

  name: z
    .string()
    .min(1, "Unit name is required.")
    .max(100)
    .trim(),

  symbol: z
    .string()
    .max(20)
    .trim()
    .nullable()
    .optional(),

  description: z
    .string()
    .max(255)
    .trim()
    .nullable()
    .optional(),

  active: z
    .boolean()
    .optional()
    .default(true),
});


export const updateUnitSchema = createUnitSchema
  .omit({
    businessId: true,
  })
  .partial();


export type CreateUnitInput =
  z.infer<typeof createUnitSchema>;


export type UpdateUnitInput =
  z.infer<typeof updateUnitSchema>;
import { z } from "zod";

export const createBranchSchema = z.object({
  businessId: z.uuid(),

  code: z
    .string()
    .trim()
    .min(2, "Branch code is required.")
    .max(20),

  name: z
    .string()
    .trim()
    .min(2, "Branch name is required.")
    .max(100),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable(),

  email: z
    .email("Invalid email address.")
    .optional()
    .nullable(),

  county: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),

  town: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable(),

  active: z.boolean().default(true),

  isHeadOffice: z.boolean().default(false),
});

export const updateBranchSchema =
  createBranchSchema
    .omit({
      businessId: true,
    })
    .partial();

export type CreateBranchInput =
  z.infer<typeof createBranchSchema>;

export type UpdateBranchInput =
  z.infer<typeof updateBranchSchema>;
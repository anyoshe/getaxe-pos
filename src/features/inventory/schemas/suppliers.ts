import { z } from "zod";

export const createSupplierSchema = z.object({
  businessId: z.string().uuid(),

  name: z
    .string()
    .trim()
    .min(2, "Supplier name is required.")
    .max(150),

  contactPerson: z
    .string()
    .trim()
    .nullable()
    .optional(),

  email: z
    .string()
    .email("Invalid email address.")
    .nullable()
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .nullable()
    .optional(),

  kraPin: z
    .string()
    .trim()
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .nullable()
    .optional(),

  town: z
    .string()
    .trim()
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),

  active: z.boolean(),
});

export type CreateSupplierInput =
  z.infer<typeof createSupplierSchema>;
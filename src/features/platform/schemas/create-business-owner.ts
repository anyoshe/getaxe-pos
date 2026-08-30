import { z } from "zod";

export const createBusinessOwnerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().nullable(),
  /** Optional — if omitted, a temporary password is generated */
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateBusinessOwnerInput = z.infer<
  typeof createBusinessOwnerSchema
>;

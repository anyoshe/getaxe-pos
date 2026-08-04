import { z } from "zod";

export const createBusinessOwnerSchema = z.object({

  name: z
    .string()
    .min(3),

  email: z
    .email(),

  phone: z
    .string()
    .optional(),

});

export type CreateBusinessOwnerInput =
  z.infer<
    typeof createBusinessOwnerSchema
  >;
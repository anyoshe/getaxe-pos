import { z } from "zod";

export const createPasswordSchema = z
  .object({
    email: z
      .email()
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

export type CreatePasswordInput =
  z.infer<
    typeof createPasswordSchema
  >;
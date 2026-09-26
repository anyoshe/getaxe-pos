import { z } from "zod";

/** Empty / null → null; otherwise a finite number 0–1000. */
const markupPercentSchema = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/%/g, "").trim());
  if (!Number.isFinite(n)) return null;
  return n;
}, z.number().min(0, "Markup must be 0 or more.").max(1000, "Markup max is 1000%.").nullable());

export const createCategorySchema = z.object({
  businessId: z.string().uuid(),

  name: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(100),

  description: z.string().trim().nullable().optional(),

  markupPercent: markupPercentSchema.optional(),

  active: z.boolean(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(100),

  description: z.string().trim().nullable().optional(),

  markupPercent: markupPercentSchema.optional(),

  active: z.boolean(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

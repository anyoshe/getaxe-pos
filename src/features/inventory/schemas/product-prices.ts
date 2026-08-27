import { z } from "zod";

export const createProductPriceSchema = z.object({
  businessId: z.uuid(),

  productId: z.uuid(),

  priceListId: z.uuid(),

  unitId: z.uuid().nullable().optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than zero."),

  minimumQuantity: z.coerce
    .number()
    .positive()
    .default(1),

  active: z.boolean(),
});

export type CreateProductPriceInput =
  z.infer<
    typeof createProductPriceSchema
  >;
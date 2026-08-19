import type { InferSelectModel } from "drizzle-orm";

import { categories } from "@/db/schema/inventory/categories";

export type Category =
  InferSelectModel<typeof categories>;
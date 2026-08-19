import type { InferSelectModel } from "drizzle-orm";

import { suppliers } from "@/db/schema/inventory/suppliers";

export type Supplier =
  InferSelectModel<typeof suppliers>;

import type {
  InferSelectModel,
} from "drizzle-orm";

import type {
  users,
} from "@/db/schema/users/users";

import type {
  roles,
} from "@/db/schema/users/roles";

import type {
  businesses,
} from "@/db/schema/core/businesses";


export type User =
  InferSelectModel<typeof users> & {
    role: InferSelectModel<typeof roles> | null;
    business: InferSelectModel<typeof businesses> | null;
  };
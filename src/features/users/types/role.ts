import type {
    InferSelectModel,
} from "drizzle-orm";

import type {
    roles,
} from "@/db/schema/users/roles";

import type {
    businesses,
} from "@/db/schema/core/businesses";

export type Role =
    InferSelectModel<typeof roles> & {

        business:
            InferSelectModel<typeof businesses> | null;

    };
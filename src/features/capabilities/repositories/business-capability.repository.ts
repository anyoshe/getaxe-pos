import { db } from "@/db";

import {
  businessCapabilities,
} from "@/db/schema";

import {
  and,
  eq,
} from "drizzle-orm";

export class BusinessCapabilityRepository {

  async enable(
    businessId: string,
    capabilityId: string,
  ) {

    return db
      .insert(
        businessCapabilities,
      )
      .values({

        businessId,

        capabilityId,

        enabled: true,

      })
      .onConflictDoUpdate({

        target: [

          businessCapabilities.businessId,

          businessCapabilities.capabilityId,

        ],

        set: {

          enabled: true,

        },

      });

  }

  async disable(
    businessId: string,
    capabilityId: string,
  ) {

    return db
      .insert(
        businessCapabilities,
      )
      .values({

        businessId,

        capabilityId,

        enabled: false,

      })
      .onConflictDoUpdate({

        target: [

          businessCapabilities.businessId,

          businessCapabilities.capabilityId,

        ],

        set: {

          enabled: false,

        },

      });

  }

  async isEnabled(
    businessId: string,
    capabilityId: string,
  ) {

    return db.query.businessCapabilities.findFirst({

      where: and(

        eq(
          businessCapabilities.businessId,
          businessId,
        ),

        eq(
          businessCapabilities.capabilityId,
          capabilityId,
        ),

      ),

    });

  }

}
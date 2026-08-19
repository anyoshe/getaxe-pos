import {
db,
} from "@/db";

import {
capabilities,
} from "@/db/schema";

import {
eq,
} from "drizzle-orm";

import type {
CapabilityDefinition,
} from "../types";

export class CapabilityRepository {

async findByCapabilityId(
  capabilityId: string,
) {
  return db.query.capabilities.findFirst({
    where: eq(
      capabilities.capabilityId,
      capabilityId,
    ),
  });
}

async findByCode(
  code: string,
) {
  return db.query.capabilities.findFirst({
    where: eq(
      capabilities.code,
      code,
    ),
  });
}

async all() {
  return db.query.capabilities.findMany();
}

async create(
  capability: CapabilityDefinition,
) {
  return db.insert(
    capabilities,
  ).values({
    code: capability.code,
    capabilityId: capability.id,
    name: capability.name,
    description: capability.description,
    module: capability.module,
    group: capability.group,
    category: capability.category,
    status: capability.status,
    defaultEnabled: capability.defaultEnabled,
    industries: capability.industries,
    dependencies: capability.dependencies,
    conflicts: capability.conflicts,
  });
}

async update(
  capability: CapabilityDefinition,
) {
  return db.update(
    capabilities,
  )
    .set({
      code: capability.code,
      capabilityId: capability.id,
      name: capability.name,
      description: capability.description,
      module: capability.module,
      group: capability.group,
      category: capability.category,
      status: capability.status,
      defaultEnabled: capability.defaultEnabled,
      industries: capability.industries,
      dependencies: capability.dependencies,
      conflicts: capability.conflicts,
    })
    .where(
      eq(
        capabilities.capabilityId,
        capability.id,
      ),
    );
}

async deleteByCapabilityId(
  capabilityId: string,
) {
  return db
    .delete(capabilities)
    .where(
      eq(
        capabilities.capabilityId,
        capabilityId,
      ),
    );
}

async allCapabilityIds() {
  const rows = await db.query.capabilities.findMany({
    columns: {
      capabilityId: true,
    },
  });

  return rows.map(
    row => row.capabilityId,
  );
}

}
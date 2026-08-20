import { db } from "@/db";

import {
  businessCapabilities,
  capabilities,
} from "@/db/schema";

import {
  and,
  eq,
} from "drizzle-orm";

import { CapabilityRegistry } from "../services/capability-registry";
import { CapabilityRepository } from "./capability.repository";

export class BusinessCapabilityRepository {
  private readonly capabilityRepository =
    new CapabilityRepository();

  private readonly registry =
    new CapabilityRegistry();

  /**
   * Ensure the catalogue capability exists in `capabilities`, then enable it
   * for the business. Handles both:
   * - current schema: business_capabilities.capability_id → capabilities.capability_id (text)
   * - legacy schema: business_capabilities.capability_id → capabilities.id (uuid)
   */
  async enable(
    businessId: string,
    capabilityId: string,
  ) {
    const capabilityRow =
      await this.ensureCapabilityRow(capabilityId);

    try {
      return await db
        .insert(businessCapabilities)
        .values({
          businessId,
          capabilityId: capabilityRow.capabilityId,
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
    } catch (stringKeyError) {
      // Legacy DB: capability_id column still references capabilities.id (uuid)
      try {
        return await db
          .insert(businessCapabilities)
          .values({
            businessId,
            // @ts-expect-error legacy uuid FK path
            capabilityId: capabilityRow.id,
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
      } catch (uuidKeyError) {
        const primary =
          stringKeyError instanceof Error
            ? stringKeyError.message
            : String(stringKeyError);
        const fallback =
          uuidKeyError instanceof Error
            ? uuidKeyError.message
            : String(uuidKeyError);

        throw new Error(
          `Failed to enable capability "${capabilityId}" for business ${businessId}. ` +
            `Tried catalogue id and UUID. Run: pnpm db:migrate && pnpm db:sync-capabilities. ` +
            `Errors: [${primary}] / [${fallback}]`,
        );
      }
    }
  }

  async disable(
    businessId: string,
    capabilityId: string,
  ) {
    const capabilityRow =
      await this.ensureCapabilityRow(capabilityId);

    try {
      return await db
        .insert(businessCapabilities)
        .values({
          businessId,
          capabilityId: capabilityRow.capabilityId,
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
    } catch {
      return db
        .insert(businessCapabilities)
        .values({
          businessId,
          // @ts-expect-error legacy uuid FK path
          capabilityId: capabilityRow.id,
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
  }

  async isEnabled(
    businessId: string,
    capabilityId: string,
  ): Promise<boolean> {
    const byCatalogue = await db.query.businessCapabilities.findFirst({
      where: and(
        eq(businessCapabilities.businessId, businessId),
        eq(businessCapabilities.capabilityId, capabilityId),
      ),
    });

    if (byCatalogue) {
      return byCatalogue.enabled;
    }

    const capabilityRow =
      await this.capabilityRepository.findByCapabilityId(capabilityId);

    if (!capabilityRow) {
      return false;
    }

    const byUuid = await db.query.businessCapabilities.findFirst({
      where: and(
        eq(businessCapabilities.businessId, businessId),
        eq(businessCapabilities.capabilityId, capabilityRow.id),
      ),
    });

    return byUuid?.enabled ?? false;
  }

  async listEnabled(
    businessId: string,
  ): Promise<string[]> {
    const rows = await db.query.businessCapabilities.findMany({
      where: and(
        eq(businessCapabilities.businessId, businessId),
        eq(businessCapabilities.enabled, true),
      ),
    });

    // Map UUID rows back to catalogue ids when possible
    const allCaps = await db.query.capabilities.findMany();
    const uuidToCatalogue = new Map(
      allCaps.map((c) => [c.id, c.capabilityId]),
    );

    const ids = rows.map((row) => {
      const asCatalogue = row.capabilityId;
      if (asCatalogue.includes(".")) {
        return asCatalogue;
      }
      return uuidToCatalogue.get(asCatalogue) ?? asCatalogue;
    });

    return Array.from(new Set(ids)).sort((a, b) => a.localeCompare(b));
  }

  private async ensureCapabilityRow(capabilityId: string) {
    let row =
      await this.capabilityRepository.findByCapabilityId(capabilityId);

    if (row) {
      return row;
    }

    const definition = this.registry.get(capabilityId);

    if (!definition) {
      throw new Error(
        `Unknown capability "${capabilityId}" — not in code catalogue.`,
      );
    }

    try {
      await this.capabilityRepository.create(definition);
    } catch {
      // Concurrent create or unique conflict — re-read
    }

    row = await this.capabilityRepository.findByCapabilityId(capabilityId);

    if (!row) {
      // Last resort: direct insert
      await db.insert(capabilities).values({
        code: definition.code,
        capabilityId: definition.id,
        name: definition.name,
        description: definition.description,
        module: definition.module,
        group: definition.group,
        category: definition.category,
        status: definition.status,
        defaultEnabled: definition.defaultEnabled,
        industries: definition.industries,
        dependencies: definition.dependencies,
        conflicts: definition.conflicts,
      });

      row =
        await this.capabilityRepository.findByCapabilityId(capabilityId);
    }

    if (!row) {
      throw new Error(
        `Could not persist capability "${capabilityId}" into the capabilities table.`,
      );
    }

    return row;
  }
}

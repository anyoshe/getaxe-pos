import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  productBatches,
  walkInDispensingItems,
  walkInDispensings,
  warehouses,
} from "@/db/schema";

export class DispensingRepository {
  async list(businessId: string) {
    return db
      .select({
        id: walkInDispensings.id,
        status: walkInDispensings.status,
        patientName: walkInDispensings.patientName,
        prescriptionRef: walkInDispensings.prescriptionRef,
        warehouseId: walkInDispensings.warehouseId,
        warehouseName: warehouses.name,
        dispensedAt: walkInDispensings.dispensedAt,
        createdAt: walkInDispensings.createdAt,
      })
      .from(walkInDispensings)
      .innerJoin(
        warehouses,
        eq(warehouses.id, walkInDispensings.warehouseId),
      )
      .where(eq(walkInDispensings.businessId, businessId))
      .orderBy(desc(walkInDispensings.createdAt));
  }

  async findById(id: string, businessId: string) {
    const [row] = await db
      .select()
      .from(walkInDispensings)
      .where(
        and(
          eq(walkInDispensings.id, id),
          eq(walkInDispensings.businessId, businessId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listItems(dispensingId: string, businessId: string) {
    return db
      .select({
        id: walkInDispensingItems.id,
        productId: walkInDispensingItems.productId,
        productName: products.name,
        productSku: products.sku,
        batchId: walkInDispensingItems.batchId,
        batchNumber: productBatches.batchNumber,
        expiryDate: productBatches.expiryDate,
        quantity: walkInDispensingItems.quantity,
        dosageInstructions: walkInDispensingItems.dosageInstructions,
      })
      .from(walkInDispensingItems)
      .innerJoin(products, eq(products.id, walkInDispensingItems.productId))
      .leftJoin(
        productBatches,
        eq(productBatches.id, walkInDispensingItems.batchId),
      )
      .where(
        and(
          eq(walkInDispensingItems.dispensingId, dispensingId),
          eq(walkInDispensingItems.businessId, businessId),
        ),
      );
  }

  async create(data: {
    businessId: string;
    warehouseId: string;
    patientName?: string | null;
    prescriptionRef?: string | null;
    notes?: string | null;
    dispensedBy: string;
    items: Array<{
      productId: string;
      batchId: string;
      quantity: string;
      dosageInstructions?: string | null;
    }>;
  }) {
    return db.transaction(async (tx) => {
      const [header] = await tx
        .insert(walkInDispensings)
        .values({
          businessId: data.businessId,
          warehouseId: data.warehouseId,
          patientName: data.patientName ?? null,
          prescriptionRef: data.prescriptionRef ?? null,
          notes: data.notes ?? null,
          status: "DRAFT",
          dispensedBy: data.dispensedBy,
        })
        .returning();

      if (data.items.length) {
        await tx.insert(walkInDispensingItems).values(
          data.items.map((i) => ({
            businessId: data.businessId,
            dispensingId: header.id,
            productId: i.productId,
            batchId: i.batchId,
            quantity: i.quantity,
            dosageInstructions: i.dosageInstructions ?? null,
          })),
        );
      }
      return header;
    });
  }

  async markCompleted(id: string, businessId: string) {
    const [row] = await db
      .update(walkInDispensings)
      .set({
        status: "COMPLETED",
        dispensedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(walkInDispensings.id, id),
          eq(walkInDispensings.businessId, businessId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async markCancelled(id: string, businessId: string) {
    const [row] = await db
      .update(walkInDispensings)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(
        and(
          eq(walkInDispensings.id, id),
          eq(walkInDispensings.businessId, businessId),
        ),
      )
      .returning();
    return row ?? null;
  }
}

export const dispensingRepository = new DispensingRepository();

import { qtyStr } from "@/lib/quantity";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { dispensingRepository } from "@/repositories/pharmacy/dispensing.repository";

export class DispensingService {
  async createAndComplete(input: {
    businessId: string;
    userId: string;
    warehouseId: string;
    patientName?: string | null;
    prescriptionRef?: string | null;
    notes?: string | null;
    items: Array<{
      productId: string;
      batchId: string;
      quantity: number;
      dosageInstructions?: string | null;
    }>;
  }) {
    if (!input.items.length) {
      throw new Error("Add at least one medicine line.");
    }

    for (const line of input.items) {
      if (!line.batchId) {
        throw new Error("Each line needs a batch (FEFO / selected).");
      }
      if (!(line.quantity > 0)) {
        throw new Error("Quantity must be greater than zero.");
      }
    }

    const header = await dispensingRepository.create({
      businessId: input.businessId,
      warehouseId: input.warehouseId,
      patientName: input.patientName,
      prescriptionRef: input.prescriptionRef,
      notes: input.notes,
      dispensedBy: input.userId,
      items: input.items.map((i) => ({
        productId: i.productId,
        batchId: i.batchId,
        quantity: qtyStr(i.quantity),
        dosageInstructions: i.dosageInstructions,
      })),
    });

    // Issue stock per line (same engine as sales stock-out)
    for (const line of input.items) {
      await inventoryService.issueStock({
        batchId: line.batchId,
        warehouseId: input.warehouseId,
        quantity: line.quantity,
        movement: {
          businessId: input.businessId,
          productId: line.productId,
          warehouseId: input.warehouseId,
          userId: input.userId,
          movementType: "SALE",
          quantity: qtyStr(-line.quantity),
          reference: `DSP-${header.id.slice(0, 8)}`,
          notes: "Pharmacy dispensing",
        },
      });
    }

    await dispensingRepository.markCompleted(header.id, input.businessId);
    return header;
  }
}

export const dispensingService = new DispensingService();

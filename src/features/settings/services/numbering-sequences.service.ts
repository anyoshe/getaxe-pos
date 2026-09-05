import {
  numberingSequencesRepository,
} from "@/repositories/settings/numbering-sequences.repository";

import type {
  CreateNumberingSequenceInput,
  UpdateNumberingSequenceInput,
  NumberingDocumentType,
} from "@/repositories/settings/numbering-sequences.repository";

const DEFAULT_DOCUMENT_SEQUENCES: {
  documentType: NumberingDocumentType;
  prefix: string;
}[] = [
  { documentType: "SALE", prefix: "INV" },
  { documentType: "CASH_SALE", prefix: "C/SALE" },
  { documentType: "PURCHASE_ORDER", prefix: "PO" },
  { documentType: "GOODS_RECEIPT", prefix: "GRN" },
  { documentType: "SUPPLIER_RETURN", prefix: "SR" },
  { documentType: "SALE_RETURN", prefix: "SRET" },
  { documentType: "PAYMENT", prefix: "PAY" },
  { documentType: "EXPENSE", prefix: "EXP" },
  { documentType: "INCOME", prefix: "INC" },
  { documentType: "JOURNAL", prefix: "JV" },
  { documentType: "STOCK_TRANSFER", prefix: "ST" },
  { documentType: "STOCK_ADJUSTMENT", prefix: "SA" },
];

class NumberingSequencesService {
  async getSequences(businessId: string) {
    return numberingSequencesRepository.findAll(businessId);
  }

  async getSequence(
    businessId: string,
    branchId: string,
    documentType: NumberingDocumentType,
  ) {
    const sequence = await numberingSequencesRepository.findByDocumentType(
      businessId,
      branchId,
      documentType,
    );
    if (!sequence) {
      throw new Error("Numbering sequence not found.");
    }
    return sequence;
  }

  async createSequence(data: CreateNumberingSequenceInput) {
    const exists = await numberingSequencesRepository.exists(
      data.businessId,
      data.branchId,
      data.documentType,
    );
    if (exists) {
      throw new Error("Numbering sequence already exists.");
    }
    return numberingSequencesRepository.create(data);
  }

  async createDefaultSequences(businessId: string, branchId: string) {
    for (const sequence of DEFAULT_DOCUMENT_SEQUENCES) {
      const exists = await numberingSequencesRepository.exists(
        businessId,
        branchId,
        sequence.documentType,
      );
      if (exists) continue;
      await numberingSequencesRepository.create({
        businessId,
        branchId,
        documentType: sequence.documentType,
        prefix: sequence.prefix,
        nextNumber: 1,
        numberLength: 6,
        separator: "-",
        resetPeriod: "NEVER",
        active: true,
      });
    }
  }

  async updateSequence(id: string, data: UpdateNumberingSequenceInput) {
    return numberingSequencesRepository.update(id, data);
  }

  async deleteSequence(id: string) {
    return numberingSequencesRepository.delete(id);
  }

  /**
   * Issue next document number from Settings → Numbering.
   * Prefer branch sequence; fall back to any active sequence for the type.
   * Auto-seeds defaults if none exist yet.
   */
  async nextDocumentNumber(
    businessId: string,
    documentType: NumberingDocumentType,
    branchId?: string | null,
  ): Promise<string> {
    let sequence =
      branchId
        ? await numberingSequencesRepository.findByDocumentType(
            businessId,
            branchId,
            documentType,
          )
        : null;

    if (!sequence || sequence.active === false) {
      sequence = await numberingSequencesRepository.findAnyForDocumentType(
        businessId,
        documentType,
      );
    }

    if (!sequence) {
      let bid = branchId ?? null;
      if (!bid) {
        try {
          const { db } = await import("@/db");
          const { branches } = await import("@/db/schema/settings/branches");
          const { eq } = await import("drizzle-orm");
          const [b] = await db
            .select({ id: branches.id })
            .from(branches)
            .where(eq(branches.businessId, businessId))
            .limit(1);
          bid = b?.id ?? null;
        } catch {
          bid = null;
        }
      }
      if (bid) {
        await this.createDefaultSequences(businessId, bid);
        sequence =
          (await numberingSequencesRepository.findByDocumentType(
            businessId,
            bid,
            documentType,
          )) ??
          (await numberingSequencesRepository.findAnyForDocumentType(
            businessId,
            documentType,
          ));
      }
    }

    if (!sequence) {
      const prefix =
        DEFAULT_DOCUMENT_SEQUENCES.find((d) => d.documentType === documentType)
          ?.prefix ?? documentType.slice(0, 3);
      return `${prefix}-000001`;
    }

    const { formatted } = await numberingSequencesRepository.allocateNext(
      sequence.id,
    );
    return formatted;
  }
}

export const numberingSequencesService = new NumberingSequencesService();

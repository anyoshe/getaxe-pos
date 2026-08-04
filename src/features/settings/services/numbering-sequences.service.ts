import {
  numberingSequencesRepository,
} from "@/repositories/settings/numbering-sequences.repository";

import type {
  CreateNumberingSequenceInput,
  UpdateNumberingSequenceInput,
} from "@/repositories/settings/numbering-sequences.repository";

type DocumentType =
  CreateNumberingSequenceInput["documentType"];

const DEFAULT_DOCUMENT_SEQUENCES: {
  documentType: DocumentType;
  prefix: string;
}[] = [
  {
    documentType: "SALE",
    prefix: "INV",
  },
  {
    documentType: "PURCHASE_ORDER",
    prefix: "PO",
  },
  {
    documentType: "GOODS_RECEIPT",
    prefix: "GRN",
  },
  {
    documentType: "SUPPLIER_RETURN",
    prefix: "SR",
  },
  {
    documentType: "SALE_RETURN",
    prefix: "SRET",
  },
  {
    documentType: "PAYMENT",
    prefix: "PAY",
  },
  {
    documentType: "EXPENSE",
    prefix: "EXP",
  },
  {
    documentType: "INCOME",
    prefix: "INC",
  },
  {
    documentType: "JOURNAL",
    prefix: "JV",
  },
  {
    documentType: "STOCK_TRANSFER",
    prefix: "ST",
  },
  {
    documentType: "STOCK_ADJUSTMENT",
    prefix: "SA",
  },
];

class NumberingSequencesService {

  async getSequences(
    businessId: string,
  ) {
    return numberingSequencesRepository.findAll(
      businessId,
    );
  }

  async getSequence(
    businessId: string,
    branchId: string,
    documentType: DocumentType,
  ) {

    const sequence =
      await numberingSequencesRepository.findByDocumentType(
        businessId,
        branchId,
        documentType,
      );

    if (!sequence) {
      throw new Error(
        "Numbering sequence not found.",
      );
    }

    return sequence;

  }

  async createSequence(
    data: CreateNumberingSequenceInput,
  ) {

    const exists =
      await numberingSequencesRepository.exists(
        data.businessId,
        data.branchId,
        data.documentType,
      );

    if (exists) {
      throw new Error(
        "Numbering sequence already exists.",
      );
    }

    return numberingSequencesRepository.create(
      data,
    );

  }

  async createDefaultSequences(
    businessId: string,
    branchId: string,
  ) {

    for (
      const sequence of DEFAULT_DOCUMENT_SEQUENCES
    ) {

      const exists =
        await numberingSequencesRepository.exists(
          businessId,
          branchId,
          sequence.documentType,
        );

      if (exists) {
        continue;
      }

      await numberingSequencesRepository.create({

        businessId,

        branchId,

        documentType:
          sequence.documentType,

        prefix:
          sequence.prefix,

        nextNumber: 1,

        numberLength: 6,

        separator: "-",

        resetPeriod: "NEVER",

        active: true,

      });

    }

  }

  async updateSequence(
    id: string,
    data: UpdateNumberingSequenceInput,
  ) {

    return numberingSequencesRepository.update(
      id,
      data,
    );

  }

  async deleteSequence(
    id: string,
  ) {

    return numberingSequencesRepository.delete(
      id,
    );

  }

}

export const numberingSequencesService =
  new NumberingSequencesService();
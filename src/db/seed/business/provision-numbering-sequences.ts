import { db } from "@/db";

import {
  and,
  eq,
} from "drizzle-orm";

import {
  numberingSequences,
} from "@/db/schema/settings/numbering_sequences";


type DocumentType =
  | "SALE"
  | "PURCHASE_ORDER"
  | "GOODS_RECEIPT"
  | "SUPPLIER_RETURN"
  | "SALE_RETURN"
  | "PAYMENT"
  | "EXPENSE"
  | "INCOME"
  | "JOURNAL"
  | "STOCK_TRANSFER"
  | "STOCK_ADJUSTMENT";


const sequences: {
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


export async function provisionNumberingSequences(
  businessId: string,
  branchId: string
) {

  console.log(
    "Provisioning numbering sequences..."
  );


  for (const sequence of sequences) {


    const existing =
      await db.query.numberingSequences.findFirst({

        where: and(

          eq(
            numberingSequences.businessId,
            businessId
          ),

          eq(
            numberingSequences.branchId,
            branchId
          ),

          eq(
            numberingSequences.documentType,
            sequence.documentType
          )

        ),

      });


    if (existing) {

      console.log(
        `Sequence already exists: ${sequence.documentType}`
      );

      continue;

    }


    await db
      .insert(numberingSequences)
      .values({

        businessId,

        branchId,

        documentType:
          sequence.documentType,

        prefix:
          sequence.prefix,

        nextNumber:
          1,

        numberLength:
          6,

        separator:
          "-",

        resetPeriod:
          "NEVER",

        active:
          true,

      });


    console.log(
      `Created sequence: ${sequence.documentType}`
    );

  }


}
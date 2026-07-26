import { db } from "@/db";
import { eq, isNull, and } from "drizzle-orm";

import { paymentMethods } from "@/db/schema/settings/payment_methods";

const DEFAULT_PAYMENT_METHODS = [
  {
    code: "CASH",
    name: "Cash",
    description: "Cash payments",
    requiresReference: false,
    isDefault: true,
  },
  {
    code: "MPESA",
    name: "M-PESA",
    description: "M-PESA Mobile Money",
    requiresReference: true,
    isDefault: false,
  },
  {
    code: "CARD",
    name: "Card",
    description: "Debit/Credit Card",
    requiresReference: true,
    isDefault: false,
  },
  {
    code: "BANK",
    name: "Bank Transfer",
    description: "Bank Transfer",
    requiresReference: true,
    isDefault: false,
  },
  {
    code: "CHEQUE",
    name: "Cheque",
    description: "Cheque Payment",
    requiresReference: true,
    isDefault: false,
  },
  {
    code: "CREDIT",
    name: "Credit",
    description: "Credit Sale",
    requiresReference: false,
    isDefault: false,
  },
];

export async function seedPaymentMethods() {
  console.log("Seeding global payment methods...");

  for (const method of DEFAULT_PAYMENT_METHODS) {
    const existing = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethods.code, method.code),
        isNull(paymentMethods.businessId)
      ),
    });

    if (existing) {
      console.log(`Skipping ${method.code}`);
      continue;
    }

    await db.insert(paymentMethods).values({
      businessId: null,
      code: method.code,
      name: method.name,
      description: method.description,
      requiresReference: method.requiresReference,
      isDefault: method.isDefault,
      active: true,
    });

    console.log(`Created ${method.code}`);
  }

  console.log("Global payment methods seeded.");
}
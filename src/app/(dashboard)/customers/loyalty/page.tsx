import { eq } from "drizzle-orm";

import { db } from "@/db";
import { customers } from "@/db/schema/sales/customers";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loyaltyService } from "@/features/sales/services/loyalty.service";
import { LoyaltyClient } from "@/features/sales/components/loyalty/loyalty-client";

export default async function LoyaltyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [program, customerRows, transactions] = await Promise.all([
    loyaltyService.getOrCreateProgram(user.businessId),
    db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        loyaltyPoints: customers.loyaltyPoints,
      })
      .from(customers)
      .where(eq(customers.businessId, user.businessId)),
    loyaltyService.listTransactions(user.businessId),
  ]);

  return (
    <LoyaltyClient
      program={{
        id: program.id,
        name: program.name,
        pointsPerAmount: String(program.pointsPerAmount),
        amountPerPointUnit: String(program.amountPerPointUnit),
        redemptionValuePerPoint: String(program.redemptionValuePerPoint),
        minRedeemPoints: program.minRedeemPoints,
        active: program.active,
      }}
      customers={customerRows.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        loyaltyPoints: c.loyaltyPoints ?? 0,
      }))}
      transactions={transactions.map((t) => ({
        id: t.id,
        customerId: t.customerId,
        type: t.type,
        points: t.points,
        balanceAfter: t.balanceAfter,
        notes: t.notes,
        createdAt: t.createdAt,
      }))}
    />
  );
}

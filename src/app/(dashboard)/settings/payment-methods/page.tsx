import { or, eq, isNull, and } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethods } from "@/db/schema/settings/payment_methods";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PaymentMethodsClient } from "@/features/settings/components/payment-methods-client";

export default async function PaymentMethodsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const methods = await db
    .select()
    .from(paymentMethods)
    .where(
      or(
        isNull(paymentMethods.businessId),
        eq(paymentMethods.businessId, user.businessId),
      ),
    )
    .catch(() => []);

  return (
    <PaymentMethodsClient
      methods={methods.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        active: m.active,
        isDefault: m.isDefault,
      }))}
    />
  );
}

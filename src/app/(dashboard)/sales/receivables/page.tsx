import { eq } from "drizzle-orm";

import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  listCustomerArBalancesAction,
  listOpenCreditInvoicesAction,
} from "@/features/sales/actions/receive-credit-payment";
import { ReceivablesClient } from "@/features/sales/components/receivables/receivables-client";

export default async function ReceivablesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [inv, acc, businessRow] = await Promise.all([
    listOpenCreditInvoicesAction(),
    listCustomerArBalancesAction(),
    db.query.businesses
      .findFirst({ where: eq(businesses.id, user.businessId) })
      .catch(() => null),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <ReceivablesClient
        invoices={inv.success ? inv.invoices : []}
        accounts={acc.success ? acc.accounts : []}
        business={{
          name: businessRow?.name ?? "GetAxe POS",
          legalName: businessRow?.legalName ?? null,
          phone: businessRow?.phone ?? null,
          email: businessRow?.email ?? null,
          address: businessRow?.address ?? null,
          town: businessRow?.town ?? null,
          county: businessRow?.county ?? null,
          kraPin: businessRow?.kraPin ?? null,
          logo: businessRow?.logo ?? null,
          currency: businessRow?.currency ?? "KES",
        }}
      />
    </div>
  );
}

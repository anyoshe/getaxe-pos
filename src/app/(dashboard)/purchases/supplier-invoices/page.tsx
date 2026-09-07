import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { supplierInvoiceService } from "@/features/purchases/services/supplier-invoice.service";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { SupplierInvoicesClient } from "@/features/purchases/components/supplier-invoices/supplier-invoices-client";

export default async function SupplierInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [invoices, suppliers, payFromAccounts] = await Promise.all([
    supplierInvoiceService.list(user.businessId).catch(() => []),
    supplierRepository.findAll(user.businessId).catch(() => []),
    db
      .select({
        id: cashAccounts.id,
        name: cashAccounts.name,
        type: cashAccounts.type,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
      })
      .from(cashAccounts)
      .innerJoin(
        chartOfAccounts,
        eq(cashAccounts.accountId, chartOfAccounts.id),
      )
      .where(
        and(
          eq(cashAccounts.businessId, user.businessId),
          eq(cashAccounts.active, true),
        ),
      )
      .catch(() => []),
  ]);

  return (
    <SupplierInvoicesClient
      invoices={invoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        supplierName: i.supplierName ?? "—",
        status: i.status,
        total: String(i.total),
        balanceDue: String(i.balanceDue),
        currency: i.currency,
        invoiceDate: i.invoiceDate,
        notes: i.notes ?? null,
      }))}
      suppliers={(suppliers as { id: string; name: string }[]).map((s) => ({
        id: s.id,
        name: s.name,
      }))}
      payFromAccounts={payFromAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: String(a.type),
        accountCode: a.accountCode,
        accountName: a.accountName,
      }))}
    />
  );
}

import { getCurrentUser } from "@/lib/auth/current-user";
import { supplierInvoiceService } from "@/features/purchases/services/supplier-invoice.service";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { SupplierInvoicesClient } from "@/features/purchases/components/supplier-invoices/supplier-invoices-client";

export default async function SupplierInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [invoices, suppliers] = await Promise.all([
    supplierInvoiceService.list(user.businessId).catch(() => []),
    supplierRepository.findAll(user.businessId).catch(() => []),
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
      }))}
      suppliers={(suppliers as { id: string; name: string }[]).map((s) => ({
        id: s.id,
        name: s.name,
      }))}
    />
  );
}

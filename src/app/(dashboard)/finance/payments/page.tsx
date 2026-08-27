import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { PaymentsList } from "@/features/finance/components/finance-pages";

export default async function FinancePaymentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  await financeService.getCashAccounts(user.businessId).catch(() => []);
  const payments = await financeService.getPayments(user.businessId).catch(() => []);
  return (
    <PaymentsList
      payments={payments.map((p) => ({
        id: p.id,
        amount: String(p.amount),
        method: String(p.method),
        status: String(p.status),
        paidAt: p.paidAt,
        invoiceNumber: p.invoiceNumber,
      }))}
    />
  );
}

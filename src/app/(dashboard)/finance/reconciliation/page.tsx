import { getCurrentUser } from "@/lib/auth/current-user";
import { cashReconciliationService } from "@/features/finance/services/cash-reconciliation.service";
import { CashReconciliationClient } from "@/features/finance/components/cash-reconciliation-client";
import { financeService } from "@/features/finance/services/finance.service";

export default async function CashReconciliationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Ensure default cash drawer exists
  await financeService.getCashAccounts(user.businessId).catch(() => []);

  const [accounts, history] = await Promise.all([
    cashReconciliationService.listAccounts(user.businessId).catch(() => []),
    cashReconciliationService.listRecent(user.businessId).catch(() => []),
  ]);

  return (
    <CashReconciliationClient
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
      }))}
      history={history.map((h) => ({
        id: h.id,
        reconciliationDate: String(h.reconciliationDate),
        accountName: h.accountName,
        accountType: h.accountType,
        openingBalance: String(h.openingBalance),
        systemInflows: String(h.systemInflows),
        systemOutflows: String(h.systemOutflows),
        expectedBalance: String(h.expectedBalance),
        countedBalance: String(h.countedBalance),
        difference: String(h.difference),
      }))}
    />
  );
}

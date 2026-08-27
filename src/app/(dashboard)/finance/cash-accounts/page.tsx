import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { CashAccountsClient } from "@/features/finance/components/finance-pages";

export default async function CashAccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [accounts, ledger] = await Promise.all([
    financeService.getCashAccounts(user.businessId).catch(() => []),
    financeService.getChartOfAccounts(user.businessId).catch(() => []),
  ]);
  return (
    <CashAccountsClient
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
      }))}
      ledgerAccounts={ledger.map((a) => ({
        id: a.id,
        accountCode: a.accountCode,
        accountName: a.accountName,
      }))}
    />
  );
}

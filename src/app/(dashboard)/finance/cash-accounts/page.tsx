import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { CashAccountsClient } from "@/features/finance/components/finance-pages";

export default async function CashAccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [accounts, ledger] = await Promise.all([
    financeService.getCashAccountsWithBalances(user.businessId).catch(() => []),
    financeService.getChartOfAccounts(user.businessId).catch(() => []),
  ]);
  return (
    <CashAccountsClient
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        openingBalance: String(a.openingBalance ?? "0"),
        accountCode: a.accountCode,
        accountName: a.accountName,
        movementIn: Number(a.movementIn ?? 0),
        movementOut: Number(a.movementOut ?? 0),
        currentBalance: Number(a.currentBalance ?? 0),
      }))}
      ledgerAccounts={ledger.map((a) => ({
        id: a.id,
        accountCode: a.accountCode,
        accountName: a.accountName,
      }))}
    />
  );
}

import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { AccountsList } from "@/features/finance/components/finance-pages";

export default async function FinanceAccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const accounts = await financeService.getChartOfAccounts(user.businessId).catch(() => []);
  return (
    <AccountsList
      accounts={accounts.map((a) => ({
        id: a.id,
        accountCode: a.accountCode,
        accountName: a.accountName,
        description: a.description,
      }))}
    />
  );
}

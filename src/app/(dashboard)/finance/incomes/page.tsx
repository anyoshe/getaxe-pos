import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { IncomesClient } from "@/features/finance/components/finance-pages";

export default async function IncomesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [rows, categories, cash] = await Promise.all([
    financeService.getIncomes(user.businessId).catch(() => []),
    financeService.getIncomeCategories(user.businessId).catch(() => []),
    financeService.getCashAccounts(user.businessId).catch(() => []),
  ]);
  return (
    <IncomesClient
      incomes={rows.map((e) => ({
        id: e.id,
        description: e.description,
        amount: String(e.amount),
        status: e.status,
        incomeDate: e.incomeDate,
      }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      cashAccounts={cash.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

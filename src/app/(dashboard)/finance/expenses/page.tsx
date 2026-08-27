import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { ExpensesClient } from "@/features/finance/components/finance-pages";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [rows, categories, cash] = await Promise.all([
    financeService.getExpenses(user.businessId).catch(() => []),
    financeService.getExpenseCategories(user.businessId).catch(() => []),
    financeService.getCashAccounts(user.businessId).catch(() => []),
  ]);
  return (
    <ExpensesClient
      expenses={rows.map((e) => ({
        id: e.id,
        description: e.description,
        amount: String(e.amount),
        status: e.status,
        expenseDate: e.expenseDate,
      }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      cashAccounts={cash.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

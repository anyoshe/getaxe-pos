import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { AccountsList } from "@/features/finance/components/finance-pages";
import { db } from "@/db";
import { accountCategories } from "@/db/schema/finance/account_categories";
import { and, eq, isNull, or, asc } from "drizzle-orm";

export default async function FinanceAccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  await financeService.getChartOfAccounts(user.businessId).catch(() => []);
  const [accounts, categories] = await Promise.all([
    financeService.getChartOfAccounts(user.businessId).catch(() => []),
    db
      .select({
        id: accountCategories.id,
        code: accountCategories.code,
        name: accountCategories.name,
      })
      .from(accountCategories)
      .where(
        or(
          isNull(accountCategories.businessId),
          eq(accountCategories.businessId, user.businessId),
        ),
      )
      .orderBy(asc(accountCategories.displayOrder))
      .catch(() => [] as { id: string; code: string; name: string }[]),
  ]);
  return (
    <AccountsList
      accounts={accounts.map((a) => ({
        id: a.id,
        accountCode: a.accountCode,
        accountName: a.accountName,
        description: a.description,
        isSystem: a.isSystem,
        accountCategoryId: a.accountCategoryId,
      }))}
      categories={categories}
    />
  );
}

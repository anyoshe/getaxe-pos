import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { recurringExpenses } from "@/db/schema/finance/recurring_expenses";
import { expenseCategories } from "@/db/schema/finance/expense_categories";

export type RecurringExpenseRow = {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  notes: string | null;
  active: boolean;
  categoryId: string;
  categoryName: string;
};

let ensuredTable = false;

/** Idempotent — creates table if migration 0045 was not applied yet. */
export async function ensureRecurringExpensesTable(): Promise<void> {
  if (ensuredTable) return;
  await db.execute(sql.raw(`
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES expense_categories(id),
  name text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  day_of_month integer NOT NULL DEFAULT 1,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recurring_expenses_business_idx
  ON recurring_expenses (business_id);
CREATE INDEX IF NOT EXISTS recurring_expenses_active_idx
  ON recurring_expenses (business_id, active);
`));
  ensuredTable = true;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Next due date on or after `from` (local calendar day). */
export function nextRecurringDueDate(dayOfMonth: number, from: Date = new Date()): Date {
  const day = Math.min(28, Math.max(1, Math.floor(dayOfMonth) || 1));
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const thisMonthDays = daysInMonth(start.getFullYear(), start.getMonth());
  const dueThis = new Date(
    start.getFullYear(),
    start.getMonth(),
    Math.min(day, thisMonthDays),
  );
  if (dueThis >= start) return dueThis;
  const y = start.getMonth() === 11 ? start.getFullYear() + 1 : start.getFullYear();
  const m = (start.getMonth() + 1) % 12;
  const nextDays = daysInMonth(y, m);
  return new Date(y, m, Math.min(day, nextDays));
}

export async function listRecurringExpenses(
  businessId: string,
  opts?: { activeOnly?: boolean },
): Promise<RecurringExpenseRow[]> {
  await ensureRecurringExpensesTable();
  const rows = await db
    .select({
      id: recurringExpenses.id,
      name: recurringExpenses.name,
      amount: recurringExpenses.amount,
      dayOfMonth: recurringExpenses.dayOfMonth,
      notes: recurringExpenses.notes,
      active: recurringExpenses.active,
      categoryId: recurringExpenses.categoryId,
      categoryName: expenseCategories.name,
    })
    .from(recurringExpenses)
    .leftJoin(
      expenseCategories,
      eq(recurringExpenses.categoryId, expenseCategories.id),
    )
    .where(
      opts?.activeOnly
        ? and(
            eq(recurringExpenses.businessId, businessId),
            eq(recurringExpenses.active, true),
          )
        : eq(recurringExpenses.businessId, businessId),
    )
    .orderBy(asc(recurringExpenses.dayOfMonth), asc(recurringExpenses.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount ?? 0),
    dayOfMonth: Number(r.dayOfMonth ?? 1),
    notes: r.notes,
    active: Boolean(r.active),
    categoryId: r.categoryId,
    categoryName: r.categoryName ?? "Expense",
  }));
}

export type UpcomingProjectedExpense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  status: "SCHEDULED";
  source: "recurring";
};

/** Active monthly templates whose next due falls within [today, today+30d). */
export async function projectUpcomingRecurring(
  businessId: string,
  today: Date = new Date(),
): Promise<{
  items: UpcomingProjectedExpense[];
  monthlyFixedTotal: number;
  upcomingCount: number;
  upcomingTotal: number;
}> {
  try {
    await ensureRecurringExpensesTable();
  } catch {
    return {
      items: [],
      monthlyFixedTotal: 0,
      upcomingCount: 0,
      upcomingTotal: 0,
    };
  }
  const active = await listRecurringExpenses(businessId, { activeOnly: true });
  const monthlyFixedTotal = active.reduce((s, r) => s + r.amount, 0);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  const items: UpcomingProjectedExpense[] = [];
  for (const r of active) {
    const due = nextRecurringDueDate(r.dayOfMonth, start);
    if (due >= start && due < end) {
      items.push({
        id: `recurring:${r.id}`,
        description: r.name,
        category: r.categoryName,
        amount: r.amount,
        expenseDate: due.toISOString().slice(0, 10),
        status: "SCHEDULED",
        source: "recurring",
      });
    }
  }

  return {
    items,
    monthlyFixedTotal,
    upcomingCount: items.length,
    upcomingTotal: items.reduce((s, i) => s + i.amount, 0),
  };
}

export async function createRecurringExpense(input: {
  businessId: string;
  categoryId: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  notes?: string | null;
  createdBy?: string | null;
}) {
  await ensureRecurringExpensesTable();
  const [row] = await db
    .insert(recurringExpenses)
    .values({
      businessId: input.businessId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      amount: input.amount.toFixed(2),
      dayOfMonth: Math.min(28, Math.max(1, Math.floor(input.dayOfMonth) || 1)),
      notes: input.notes?.trim() || null,
      active: true,
      createdBy: input.createdBy ?? null,
    })
    .returning({ id: recurringExpenses.id });
  return row;
}

export async function setRecurringExpenseActive(
  businessId: string,
  id: string,
  active: boolean,
) {
  await ensureRecurringExpensesTable();
  await db
    .update(recurringExpenses)
    .set({ active, updatedAt: new Date() })
    .where(
      and(
        eq(recurringExpenses.id, id),
        eq(recurringExpenses.businessId, businessId),
      ),
    );
}

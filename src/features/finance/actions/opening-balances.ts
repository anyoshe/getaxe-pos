"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { journalPostingService } from "@/features/finance/services/journal-posting.service";
import { ensureFinanceDefaults, financeService } from "@/features/finance/services/finance.service";

async function authFinance() {
  try {
    return await requireAuthorizedUser("accounts.update");
  } catch {
    return await requireAuthorizedUser("business.update");
  }
}

export async function getOpeningBalancesStateAction() {
  const user = await authFinance();
  await ensureFinanceDefaults(user.businessId);

  const accounts = await db
    .select({
      id: cashAccounts.id,
      name: cashAccounts.name,
      type: cashAccounts.type,
      currency: cashAccounts.currency,
      openingBalance: cashAccounts.openingBalance,
    })
    .from(cashAccounts)
    .where(
      and(
        eq(cashAccounts.businessId, user.businessId),
        eq(cashAccounts.active, true),
      ),
    );

  const [stock] = await db
    .select({ c: inventoryBalances.id })
    .from(inventoryBalances)
    .where(eq(inventoryBalances.businessId, user.businessId))
    .limit(1);

  const openingJournals = await db
    .select({ id: journalEntries.id })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.businessId, user.businessId),
        eq(journalEntries.sourceType, "OPENING_BALANCE"),
      ),
    )
    .limit(5);

  const totalOpeningCash = accounts.reduce(
    (s, a) => s + Number(a.openingBalance ?? 0),
    0,
  );

  return {
    success: true as const,
    data: {
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: String(a.type),
        currency: a.currency,
        openingBalance: Number(a.openingBalance ?? 0),
      })),
      totalOpeningCash,
      hasStockOnHand: Boolean(stock),
      hasOpeningJournals: openingJournals.length > 0,
      openingJournalCount: openingJournals.length,
    },
  };
}

const saveSchema = z.object({
  lines: z
    .array(
      z.object({
        cashAccountId: z.string().uuid(),
        openingBalance: z.coerce.number().min(0),
      }),
    )
    .min(1),
  /** Post Dr Cash / Cr Equity for amounts greater than previous opening */
  postJournal: z.boolean().default(true),
});

export async function saveOpeningCashBalancesAction(input: unknown) {
  const user = await authFinance();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check opening cash amounts." };
  }

  await ensureFinanceDefaults(user.businessId);

  try {
    for (const line of parsed.data.lines) {
      const [existing] = await db
        .select()
        .from(cashAccounts)
        .where(
          and(
            eq(cashAccounts.id, line.cashAccountId),
            eq(cashAccounts.businessId, user.businessId),
          ),
        )
        .limit(1);
      if (!existing) continue;

      const prev = Number(existing.openingBalance ?? 0);
      const next = line.openingBalance;

      await db
        .update(cashAccounts)
        .set({
          openingBalance: next.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, line.cashAccountId));

      if (parsed.data.postJournal && next > prev + 0.001) {
        const delta = next - prev;
        // Post to the till's linked ledger (1000/1100/1110/1120/1130…), not a type guess
        const code =
          (await financeService.getCashAccountGlCode(
            user.businessId,
            existing.id,
          )) ?? "1000";
        try {
          await journalPostingService.postOpeningCash({
            businessId: user.businessId,
            sourceId: existing.id,
            amount: delta,
            cashAccountCode: code,
            description: `Opening cash — ${existing.name}`,
            postedBy: user.id,
          });
        } catch (e) {
          console.error("[opening cash journal]", e);
        }
      }
    }

    revalidatePath("/finance/opening-balances");
    revalidatePath("/finance/cash-accounts");
    revalidatePath("/finance/journals");
    revalidatePath("/settings/readiness");
    revalidatePath("/reports/finance");

    return {
      success: true as const,
      message: "Opening cash balances saved.",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save opening cash.",
    };
  }
}

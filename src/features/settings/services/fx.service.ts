import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeRates } from "@/db/schema/settings/exchange_rates";

export class FxService {
  async listRates(businessId: string) {
    return db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.businessId, businessId))
      .orderBy(desc(exchangeRates.effectiveDate));
  }

  async upsertRate(input: {
    businessId: string;
    fromCurrency: string;
    toCurrency: string;
    rate: string;
    effectiveDate?: string;
  }) {
    const from = input.fromCurrency.toUpperCase();
    const to = input.toCurrency.toUpperCase();
    if (from === to) throw new Error("From and to currency must differ");

    const [row] = await db
      .insert(exchangeRates)
      .values({
        businessId: input.businessId,
        fromCurrency: from,
        toCurrency: to,
        rate: input.rate,
        effectiveDate: input.effectiveDate ?? new Date().toISOString().slice(0, 10),
        active: true,
      })
      .onConflictDoUpdate({
        target: [
          exchangeRates.businessId,
          exchangeRates.fromCurrency,
          exchangeRates.toCurrency,
          exchangeRates.effectiveDate,
        ],
        set: {
          rate: input.rate,
          active: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  /**
   * Convert amount from one currency to another using latest active rate.
   * Tries direct pair then inverse.
   */
  async convert(
    businessId: string,
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ amount: number; rate: number; path: string }> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    if (from === to) {
      return { amount, rate: 1, path: "identity" };
    }

    const rates = await this.listRates(businessId);
    const direct = rates.find(
      (r) => r.active && r.fromCurrency === from && r.toCurrency === to,
    );
    if (direct) {
      const rate = Number(direct.rate);
      return { amount: amount * rate, rate, path: `${from}/${to}` };
    }

    const inverse = rates.find(
      (r) => r.active && r.fromCurrency === to && r.toCurrency === from,
    );
    if (inverse) {
      const rate = 1 / Number(inverse.rate);
      return { amount: amount * rate, rate, path: `1/(${to}/${from})` };
    }

    throw new Error(
      `No exchange rate for ${from} → ${to}. Add one under Settings → Currencies.`,
    );
  }
}

export const fxService = new FxService();

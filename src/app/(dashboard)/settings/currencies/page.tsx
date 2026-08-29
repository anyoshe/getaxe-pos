import { db } from "@/db";
import { currencies } from "@/db/schema/settings/currencies";
import { getCurrentUser } from "@/lib/auth/current-user";
import { fxService } from "@/features/settings/services/fx.service";
import { CurrenciesClient } from "@/features/settings/components/currencies-client";

export default async function CurrenciesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const base =
    (user as { business?: { currency?: string } }).business?.currency ?? "KES";

  const [catalogue, rates] = await Promise.all([
    db.select().from(currencies).catch(() => []),
    fxService.listRates(user.businessId).catch(() => []),
  ]);

  return (
    <CurrenciesClient
      baseCurrency={base}
      catalogue={catalogue.map((c) => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
      }))}
      rates={rates.map((r) => ({
        id: r.id,
        fromCurrency: r.fromCurrency,
        toCurrency: r.toCurrency,
        rate: String(r.rate),
        effectiveDate: String(r.effectiveDate),
        active: r.active,
      }))}
    />
  );
}

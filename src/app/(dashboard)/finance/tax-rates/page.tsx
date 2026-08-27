import { getCurrentUser } from "@/lib/auth/current-user";
import { financeService } from "@/features/finance/services/finance.service";
import { TaxRatesClient } from "@/features/finance/components/finance-pages";

export default async function TaxRatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rates = await financeService.getTaxRates(user.businessId).catch(() => []);
  return (
    <TaxRatesClient
      rates={rates.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        rate: String(r.rate),
        isDefault: r.isDefault,
      }))}
    />
  );
}

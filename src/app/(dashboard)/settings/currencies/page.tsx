import { db } from "@/db";
import { currencies } from "@/db/schema/settings/currencies";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function CurrenciesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rows = await db.select().from(currencies).catch(() => []);
  const base = user.business?.currency ?? "KES";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Currencies</h1>
        <p className="text-sm text-muted-foreground">
          Business base currency: <strong>{base}</strong> (change under Business
          profile). Catalogue below supports multi-currency expansion; amounts
          remain stored in base currency.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Symbol</th>
              <th className="p-3">Default</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No currency rows. Base currency {base} still applies.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.symbol}</td>
                  <td className="p-3">{c.isDefault ? "Yes" : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

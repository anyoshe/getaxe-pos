import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listJournals } from "@/features/finance/services/ap-aging.service";

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function JournalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const journals = await listJournals(user.businessId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>
        <p className="text-sm text-muted-foreground">
          Full double-entry trail — every GRN, sale, and AP payment posts debit
          and credit lines with account codes.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">What you should see</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Goods received:</strong> Debit Inventory (1200) · Credit
            Accounts Payable (2000)
          </li>
          <li>
            <strong>Pay supplier:</strong> Debit Accounts Payable (2000) ·
            Credit Cash (1000)
          </li>
          <li>
            <strong>POS sale:</strong> Debit Cash · Credit Sales (and COGS /
            Inventory when tracked)
          </li>
        </ul>
      </div>

      {journals.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          No journals yet. Complete a POS sale, goods receipt, or supplier
          payment to post the first entries.
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((j) => (
            <article
              key={j.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-semibold">
                    {j.journalNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {j.transactionDate
                      ? new Date(j.transactionDate).toLocaleString()
                      : "—"}
                    {" · "}
                    <span className="font-medium text-foreground">
                      {j.sourceType}
                    </span>
                    {j.reference ? ` · ref ${j.reference}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-muted-foreground">{j.status}</p>
                  <p className="tabular-nums text-foreground">
                    Dr {money(j.totalDebit)} · Cr {money(j.totalCredit)}
                  </p>
                </div>
              </header>
              <p className="border-b px-4 py-2 text-sm">{j.description}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2 pl-4">Account</th>
                      <th className="p-2">Line note</th>
                      <th className="p-2 text-right">Debit</th>
                      <th className="p-2 pr-4 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {j.lines.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No lines stored for this journal (post may have
                          failed when CoA was incomplete).
                        </td>
                      </tr>
                    ) : (
                      j.lines.map((l) => (
                        <tr key={l.id} className="border-t">
                          <td className="p-2 pl-4">
                            <span className="font-mono text-xs">
                              {l.accountCode}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {l.accountName}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {l.description ?? "—"}
                          </td>
                          <td className="p-2 text-right tabular-nums">
                            {l.debit > 0 ? money(l.debit) : "—"}
                          </td>
                          <td className="p-2 pr-4 text-right tabular-nums">
                            {l.credit > 0 ? money(l.credit) : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/finance/ap-aging" className="text-primary hover:underline">
          AP aging →
        </Link>
        <Link
          href="/finance/accounts"
          className="text-primary hover:underline"
        >
          Chart of accounts →
        </Link>
        <Link
          href="/purchases/supplier-invoices"
          className="text-primary hover:underline"
        >
          Supplier invoices →
        </Link>
      </div>
    </div>
  );
}

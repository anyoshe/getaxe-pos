import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listJournals } from "@/features/finance/services/ap-aging.service";

export default async function JournalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const journals = await listJournals(user.businessId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>
        <p className="text-sm text-muted-foreground">
          System-posted double-entry journals from sales, purchases, and other
          documents.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Number</th>
              <th className="p-3">Date</th>
              <th className="p-3">Source</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {journals.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No journals yet. Complete a POS sale or goods receipt to post
                  the first entries.
                </td>
              </tr>
            ) : (
              journals.map((j) => (
                <tr key={j.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{j.journalNumber}</td>
                  <td className="p-3 whitespace-nowrap">
                    {j.transactionDate
                      ? new Date(j.transactionDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-3">{j.sourceType}</td>
                  <td className="p-3">{j.description}</td>
                  <td className="p-3">{j.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Link href="/finance/ap-aging" className="text-sm text-primary hover:underline">
        AP aging →
      </Link>
    </div>
  );
}

import { requirePageAccess } from "@/lib/auth/authorize";
import Link from "next/link";

import { OpeningBalancesClient } from "@/features/finance/components/opening-balances-client";

export default async function OpeningBalancesPage() {
  await requirePageAccess("accounts.update");

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link
        href="/settings/go-live"
        className="text-sm text-primary hover:underline"
      >
        ← Go live in 1 day
      </Link>
      <OpeningBalancesClient />
    </div>
  );
}

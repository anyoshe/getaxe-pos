import Link from "next/link";

import { OpeningBalancesClient } from "@/features/finance/components/opening-balances-client";

export default function OpeningBalancesPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link
        href="/settings/readiness"
        className="text-sm text-primary hover:underline"
      >
        ← Go-live readiness
      </Link>
      <OpeningBalancesClient />
    </div>
  );
}

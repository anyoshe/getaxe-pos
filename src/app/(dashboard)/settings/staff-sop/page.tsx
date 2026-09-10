import Link from "next/link";

export const dynamic = "force-dynamic";

export default function StaffSopPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/settings" className="text-sm text-primary hover:underline">
          ← Settings
        </Link>
        <p className="text-sm text-muted-foreground">
          Print with <span className="font-medium text-foreground">Ctrl+P</span>{" "}
          / Cmd+P
        </p>
      </div>

      <article className="space-y-5 rounded-xl border bg-card p-5 text-sm leading-relaxed print:border-0 print:p-0">
        <header className="border-b pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            GetAxe POS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Staff SOP</h1>
          <p className="mt-1 text-muted-foreground">
            Keep at the till. Managers: see docs/GO_LIVE.md for full go-live
            checklist and backups.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Shop: _____________ Branch: _____________ From: _____________
          </p>
        </header>

        <section>
          <h2 className="text-base font-semibold">1. Start of day</h2>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>Log in with your own user. Do not share passwords.</li>
            <li>On POS, confirm the warehouse matches the stock you sell from.</li>
            <li>
              If required, record opening cash under Finance → Daily
              reconciliation.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold">2. Selling (POS)</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <strong>Cash sale</strong> for immediate payment (cash, M-Pesa,
              card, bank).
            </li>
            <li>
              <strong>Credit invoice</strong> only for registered credit
              customers.
            </li>
            <li>
              Medicines: select <strong>batch / expiry</strong> (FEFO) when
              prompted.
            </li>
            <li>Serialized items: select the required serial numbers.</li>
            <li>
              Loyalty: enter phone only when the customer asks (optional).
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Use <strong>Dispensing</strong> only for clinical dispense logs —
            normal paid sales go through POS unless the manager says otherwise.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">3. Stock in</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Supplier orders: Purchases → Orders → Receiving (GRN). Enter batch
              and expiry when required.
            </li>
            <li>
              Stock already owned before GetAxe: opening stock — not a fake
              purchase order.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">4. Other money</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Pay suppliers: Supplier invoices → choose the correct till/account.
            </li>
            <li>Expenses: Finance → Expenses.</li>
            <li>Non-POS income: Finance → Other income.</li>
            <li>Credit collections: Sales → Receivables → correct till.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">5. End of day</h2>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>
              Finance → Daily reconciliation (day-only for today’s activity).
            </li>
            <li>Count cash / check M-Pesa vs Expected; save the recon.</li>
            <li>Report any difference to the manager; log out.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold">6. Never</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Shared logins or unlocked POS.</li>
            <li>Skipping batch/serial when the system requires them.</li>
            <li>Paying suppliers from the wrong account to force a match.</li>
          </ul>
        </section>

        <section className="border-t pt-3">
          <h2 className="text-base font-semibold">Escalation</h2>
          <p className="mt-1">
            Stock/POS issues: _____________ &nbsp; System/password: _____________
            &nbsp; Cash difference: _____________
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Manager sign-off (training week): _____________ Date: _____________
          </p>
        </section>
      </article>

      <p className="text-center text-xs text-muted-foreground print:hidden">
        Press <kbd className="rounded border px-1">Ctrl</kbd>+
        <kbd className="rounded border px-1">P</kbd> (or Cmd+P) to print this
        page.
      </p>
    </div>
  );
}

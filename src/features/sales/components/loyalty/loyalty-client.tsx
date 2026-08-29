"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  adjustCustomerLoyaltyAction,
  updateLoyaltyProgramAction,
} from "../../actions/loyalty-ui";

type Program = {
  id: string;
  name: string;
  pointsPerAmount: string;
  amountPerPointUnit: string;
  redemptionValuePerPoint: string;
  minRedeemPoints: number;
  active: boolean;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  loyaltyPoints: number;
};

type Tx = {
  id: string;
  customerId: string;
  type: string;
  points: number;
  balanceAfter: number;
  notes: string | null;
  createdAt: Date | string;
};

export function LoyaltyClient({
  program,
  customers,
  transactions,
}: {
  program: Program;
  customers: Customer[];
  transactions: Tx[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [prog, setProg] = useState(program);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [points, setPoints] = useState(10);
  const [type, setType] = useState<"EARN" | "REDEEM" | "ADJUST" | "BONUS">(
    "BONUS",
  );
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Customer loyalty
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure earn/redeem rules, award bonus points, redeem, or adjust
          balances. Every change is recorded in the points ledger.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h2 className="font-semibold">Program rules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Program name">
            <Input
              value={prog.name}
              onChange={(e) => setProg({ ...prog, name: e.target.value })}
            />
          </Field>
          <Field label="Points earned per unit amount">
            <Input
              type="number"
              step="0.01"
              value={prog.pointsPerAmount}
              onChange={(e) =>
                setProg({ ...prog, pointsPerAmount: e.target.value })
              }
            />
          </Field>
          <Field label="Amount unit (e.g. 100 = per KSh 100)">
            <Input
              type="number"
              step="0.01"
              value={prog.amountPerPointUnit}
              onChange={(e) =>
                setProg({ ...prog, amountPerPointUnit: e.target.value })
              }
            />
          </Field>
          <Field label="Redemption value per point (currency)">
            <Input
              type="number"
              step="0.01"
              value={prog.redemptionValuePerPoint}
              onChange={(e) =>
                setProg({ ...prog, redemptionValuePerPoint: e.target.value })
              }
            />
          </Field>
          <Field label="Minimum points to redeem">
            <Input
              type="number"
              value={prog.minRedeemPoints}
              onChange={(e) =>
                setProg({
                  ...prog,
                  minRedeemPoints: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm pt-6">
            <input
              type="checkbox"
              checked={prog.active}
              onChange={(e) => setProg({ ...prog, active: e.target.checked })}
            />
            Program active
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Example: 1 point per 100 amount unit → sale of 500 earns 5 points.
          Redemption value 1 means 100 points = 100 currency units off.
        </p>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateLoyaltyProgramAction({
                name: prog.name,
                pointsPerAmount: Number(prog.pointsPerAmount),
                amountPerPointUnit: Number(prog.amountPerPointUnit),
                redemptionValuePerPoint: Number(prog.redemptionValuePerPoint),
                minRedeemPoints: prog.minRedeemPoints,
                active: prog.active,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Save program
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">Award / redeem / adjust</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Customer">
            <select
              className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.firstName, c.lastName].filter(Boolean).join(" ")} ·{" "}
                  {c.loyaltyPoints} pts
                  {c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select
              className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="BONUS">Bonus award</option>
              <option value="EARN">Manual earn</option>
              <option value="REDEEM">Redeem</option>
              <option value="ADJUST">Adjust (+/−)</option>
            </select>
          </Field>
          <Field label={type === "ADJUST" ? "Points (+/−)" : "Points"}>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <Button
          type="button"
          disabled={pending || !customerId}
          onClick={() =>
            start(async () => {
              const r = await adjustCustomerLoyaltyAction({
                customerId,
                points,
                type,
                notes: notes || null,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Apply
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Points ledger</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Type</th>
                <th className="p-3">Points</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No ledger entries yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">{t.type}</td>
                    <td className="p-3 tabular-nums">
                      {t.points > 0 ? `+${t.points}` : t.points}
                    </td>
                    <td className="p-3 tabular-nums">{t.balanceAfter}</td>
                    <td className="p-3">{t.notes ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

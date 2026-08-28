"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createPaymentMethodAction } from "../actions/settings-ui";

type Method = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  isDefault: boolean;
};

export function PaymentMethodsClient({ methods }: { methods: Method[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment methods</h1>
        <p className="text-sm text-muted-foreground">
          Methods available at POS and on invoices (Cash, M-Pesa, Card…).
        </p>
      </div>

      <div className="grid max-w-lg gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MPESA" />
          </div>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="M-Pesa" />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createPaymentMethodAction({ code, name });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                setCode("");
                setName("");
                router.refresh();
              }
            })
          }
        >
          Add method
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Default</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3 font-mono text-xs">{m.code}</td>
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.isDefault ? "Yes" : "—"}</td>
                <td className="p-3">{m.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

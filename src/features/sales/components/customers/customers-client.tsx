"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createCustomerAction } from "../../actions/create-customer";

type Customer = {
  id: string;
  customerNumber: string | null;
  firstName: string;
  lastName: string | null;
  companyName: string | null;
  phone: string | null;
  email: string | null;
};

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCustomerAction({
        firstName,
        lastName: lastName || null,
        phone: phone || null,
        email: email || null,
        customerType: "INDIVIDUAL",
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Sales
        </p>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Walk-in sales work without a customer; add regulars for credit and
          history later.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2"
      >
        <div className="space-y-1">
          <Label>First name *</Label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Last name</Label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Add customer"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">#</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                    {c.companyName ? (
                      <span className="block text-xs text-muted-foreground">
                        {c.companyName}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {c.phone ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {c.customerNumber ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

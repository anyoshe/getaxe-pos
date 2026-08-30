"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getBusinessOwnersAction } from "../../actions";
import { resetOwnerPasswordAction } from "../../actions/reset-owner-password";
import { BusinessOwnerDialog } from "./business-owner-dialog";

type Owner = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string | Date;
  hasPassword: boolean;
};

export function BusinessOwnerTable() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [open, setOpen] = useState(false);
  const [resetPw, setResetPw] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    const result = await getBusinessOwnersAction();
    if (result.success) setOwners(result.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onReset(id: string) {
    const r = await resetOwnerPasswordAction(id);
    if (!r.success) {
      toast.error(r.message);
      return;
    }
    setResetPw({ email: r.email, password: r.temporaryPassword });
    toast.success("New temporary password generated");
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Platform
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Business owners</h1>
          <p className="text-sm text-muted-foreground">
            Invite clients and hand them first-login credentials for business
            setup.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setOpen(true)}>
          Invite owner
        </Button>
      </div>

      {resetPw ? (
        <div className="rounded-xl border border-chart-4/30 bg-chart-4/10 p-4 text-sm">
          <p className="font-semibold text-chart-4">New temporary password</p>
          <p className="mt-1 font-mono">
            {resetPw.email} · {resetPw.password}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setResetPw(null)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Invited</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  No owners invited yet. Click Invite owner to create the first
                  client login.
                </td>
              </tr>
            ) : (
              owners.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{o.name}</td>
                  <td className="p-3 font-mono text-xs">{o.email}</td>
                  <td className="p-3 text-muted-foreground">{o.phone ?? "—"}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    {o.status !== "COMPLETED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void onReset(o.id)}
                      >
                        Reset temp password
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Live</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BusinessOwnerDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => void load()}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    INVITED: "bg-muted text-muted-foreground",
    PASSWORD_CREATED: "bg-chart-2/20 text-accent-foreground",
    COMPLETED: "bg-chart-4/20 text-chart-4",
  };
  const label: Record<string, string> = {
    INVITED: "Invited",
    PASSWORD_CREATED: "Ready to login",
    COMPLETED: "Setup complete",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[status] ?? "bg-muted"}`}
    >
      {label[status] ?? status}
    </span>
  );
}

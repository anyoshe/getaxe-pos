"use client";

import { useEffect, useState } from "react";

import { getBusinessesAction } from "../../actions/get-businesses";

type Biz = {
  id: string;
  name: string;
  businessType: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  currency: string;
  createdAt: string | Date;
};

export function BusinessTable() {
  const [rows, setRows] = useState<Biz[]>([]);

  useEffect(() => {
    void getBusinessesAction().then((r) => {
      if (r.success) setRows(r.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Platform
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Businesses</h1>
        <p className="text-sm text-muted-foreground">
          Tenants created after owners complete setup. Type drives capability
          profiles (pharmacy, retail, hardware, …) with DEFAULT for unknown
          types.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-semibold">Business</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Contact</th>
              <th className="p-3 font-semibold">Currency</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  No businesses yet. Invite an owner and have them complete
                  /setup.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {b.businessType}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {[b.email, b.phone].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="p-3">{b.currency}</td>
                  <td className="p-3">
                    <span
                      className={
                        b.active
                          ? "text-chart-4 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {b.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString()}
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

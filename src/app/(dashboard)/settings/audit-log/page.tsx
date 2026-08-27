import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs } from "@/db/schema/infrastructure/activity_logs";
import { users } from "@/db/schema/users/users";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rows = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entity: activityLogs.entity,
      entityId: activityLogs.entityId,
      description: activityLogs.description,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.businessId, user.businessId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(150)
    .catch(() => []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Who did what in this business — sales, purchases, goods receipts, and more.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No activity recorded yet. New sales and receipts will appear here.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-3">
                    {r.userName || r.userEmail || "—"}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {r.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs">{r.entity}</td>
                  <td className="p-3">{r.description ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

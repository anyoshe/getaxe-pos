import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listCapabilitiesStateAction } from "@/features/settings/actions/capabilities-ui";
import { CapabilitiesClient } from "@/features/settings/components/capabilities-client";

export default async function CapabilitiesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const state = await listCapabilitiesStateAction();

  if (!state.success) {
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-xl border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Access restricted</h1>
        <p className="text-sm text-muted-foreground">
          {state.message ??
            "Only administrators can view and change business capabilities."}
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <CapabilitiesClient initial={state.capabilities} />;
}

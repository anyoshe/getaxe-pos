import { getCurrentUser } from "@/lib/auth/current-user";
import { listCapabilitiesStateAction } from "@/features/settings/actions/capabilities-ui";
import { CapabilitiesClient } from "@/features/settings/components/capabilities-client";

export default async function CapabilitiesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const state = await listCapabilitiesStateAction();
  if (!state.success) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Unable to load capabilities.
      </p>
    );
  }

  return <CapabilitiesClient initial={state.capabilities} />;
}

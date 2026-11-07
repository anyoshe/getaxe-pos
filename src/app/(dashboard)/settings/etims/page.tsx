import { getCurrentUser } from "@/lib/auth/current-user";
import { getEtimsSettingsAction } from "@/features/finance/actions/etims";
import { EtimsSettingsClient } from "@/features/finance/components/etims-settings-client";

export default async function EtimsSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const res = await getEtimsSettingsAction();
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">eTIMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional KRA electronic tax invoice path. Leave off for shops that only
          need normal POS receipts. Enable per business when you are ready to
          train (simulation) or prepare for live integration.
        </p>
      </div>
      <EtimsSettingsClient
        initial={
          res.success
            ? res.settings
            : {
                enabled: false,
                environment: "simulation",
                kraPin: "",
                branchId: "",
                deviceSerial: "",
                notes: "",
              }
        }
      />
    </div>
  );
}

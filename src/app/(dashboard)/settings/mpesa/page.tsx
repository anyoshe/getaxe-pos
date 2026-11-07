import { getCurrentUser } from "@/lib/auth/current-user";
import { getMpesaSettingsAction } from "@/features/finance/actions/mpesa";
import { MpesaSettingsClient } from "@/features/finance/components/mpesa-settings-client";

export default async function MpesaSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const res = await getMpesaSettingsAction();
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">M-Pesa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Safaricom Daraja for STK Push on POS. Each business uses its own
          Till or Paybill credentials. Simulation mode works without API keys for
          training.
        </p>
      </div>
      <MpesaSettingsClient
        initial={
          res.success
            ? res.settings
            : {
                enabled: false,
                environment: "sandbox",
                shortcodeType: "TILL",
                shortcode: "",
                accountReference: "GetAxe",
                transactionDesc: "POS Sale",
                simulationMode: true,
                hasCredentials: false,
              }
        }
      />
    </div>
  );
}

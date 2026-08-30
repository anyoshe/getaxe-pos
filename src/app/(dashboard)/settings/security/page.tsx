import { ChangePasswordForm } from "@/features/settings/components/change-password-form";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground">
          Change the password you use to sign in to GetAxe for this business.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

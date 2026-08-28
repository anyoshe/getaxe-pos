import { RolesClient } from "@/features/users/components";

export default function RolesSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Roles & permissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Define what each role can view and change across GetAxe.
        </p>
      </div>
      <RolesClient />
    </div>
  );
}

import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";

import { BusinessSetupForm } from "@/features/business/components/setup/business-setup-form";

export default async function BusinessSetupPage() {
  const user = await requireCurrentUser();

  //
  // Business already provisioned.
  //

  if (user.businessId) {
    redirect("/dashboard");
  }

  return (
    <main className="container mx-auto max-w-3xl py-12">
      <BusinessSetupForm />
    </main>
  );
}
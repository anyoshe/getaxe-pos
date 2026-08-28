import { eq } from "drizzle-orm";

import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { getCurrentUser } from "@/lib/auth/current-user";
import { businessSettingsRepository } from "@/repositories/settings/business-settings.repository";
import { BusinessProfileClient } from "@/features/settings/components/business-profile-client";

export default async function BusinessSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [biz] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, user.businessId))
    .limit(1);

  if (!biz) {
    return <p className="p-6 text-sm text-muted-foreground">Business not found.</p>;
  }

  const settings = await businessSettingsRepository
    .findByBusinessId(user.businessId)
    .catch(() => null);

  return (
    <BusinessProfileClient
      profile={{
        name: biz.name,
        legalName: biz.legalName,
        registrationNumber: biz.registrationNumber,
        kraPin: biz.kraPin,
        email: biz.email,
        phone: biz.phone,
        website: biz.website,
        county: biz.county,
        town: biz.town,
        address: biz.address,
        currency: biz.currency,
        businessType: biz.businessType,
        country: biz.country,
        timezone: biz.timezone,
      }}
      ops={{
        allowNegativeStock: settings?.allowNegativeStock ?? false,
        trackInventoryByBatch: settings?.trackInventoryByBatch ?? true,
        enableExpiryTracking: settings?.enableExpiryTracking ?? true,
        requireCustomerOnSale: settings?.requireCustomerOnSale ?? false,
        requireSupplierOnPurchase: settings?.requireSupplierOnPurchase ?? true,
        allowBackdatedTransactions: settings?.allowBackdatedTransactions ?? false,
        autoPostJournals: settings?.autoPostJournals ?? true,
      }}
    />
  );
}

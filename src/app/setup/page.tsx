import { redirect } from "next/navigation";

import { getCurrentOnboardingUser } from "@/lib/onboarding-auth/current-onboarding-user";

import {
  OnboardingLayout,
} from "@/features/business/components/setup/onboarding-layout";

import {
  currenciesService,
  countriesService,
} from "@/features/settings/services";

import { BusinessSetupForm } from "@/features/business/components/setup/business-setup-form";

type Props = {
  searchParams: Promise<{
    email?: string;
  }>;
};

/**
 * Business setup is only available during onboarding (invitation session).
 * If the onboarding cookie is missing/expired, send the user back to login.
 */
export default async function BusinessSetupPage({
  searchParams,
}: Props) {
  await searchParams;

  const onboardingUser =
    await getCurrentOnboardingUser();

  if (!onboardingUser) {
    redirect("/login?next=/setup");
  }

  const [currencies, countries] = await Promise.all([
    currenciesService.getActiveCurrencies(),
    countriesService.getActiveCountries(),
  ]);

  return (
    <OnboardingLayout>
      <BusinessSetupForm
        currencies={currencies}
        countries={countries}
      />
    </OnboardingLayout>
  );
}

import { requireOnboardingUser } from "@/lib/onboarding-auth/current-onboarding-user";

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

export default async function BusinessSetupPage({
  searchParams,
}: Props) {

  const {
    email,
  } = await searchParams;

  const [
    currencies,
    countries,
  ] = await Promise.all([
    currenciesService.getActiveCurrencies(),
    countriesService.getActiveCountries(),
  ]);

  let user = null;

  if (!email) {

    const user = await requireOnboardingUser();

    

  }
  return (

    <OnboardingLayout>

      <BusinessSetupForm
        currencies={currencies}
        countries={countries}
      />

    </OnboardingLayout>

  );
}
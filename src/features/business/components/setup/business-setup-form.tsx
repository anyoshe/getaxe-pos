"use client";

import {
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { SetupShell } from "./setup-shell";
import { SetupProgress } from "./setup-progress";
import { SetupNavigation } from "./setup-navigation";

import { useBusinessSetup } from "./hooks/use-business-setup";
import {
  businessSetupSchema,
} from "../../schemas/business-setup-schema";
import { StepBusiness } from "./steps/step-business";
import { StepBranch } from "./steps/step-branch";
import { StepOwner } from "./steps/step-owner";
import { StepPreferences } from "./steps/step-preferences";
import { StepReview } from "./steps/step-review";

import {
  createBusinessAction,
} from "../../actions/create-business";

type BusinessSetupFormProps = {

  currencies: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  }[];

  countries: {
    id: string;
    code: string;
    name: string;
    currencyCode: string | null;
    timezone: string | null;
  }[];

};

export function BusinessSetupForm({
  currencies,
  countries,
}: BusinessSetupFormProps) {

  const router = useRouter();


  const {
    state,
    updateData,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
  } = useBusinessSetup();


  const [error, setError] =
    useState<string | null>(null);


  const [loading, setLoading] =
    useState(false);



  const steps = useMemo(
    () => [
      {
        title: "Business",
        component: (
          <StepBusiness
            data={state.data}
            updateData={updateData}
          />
        ),
      },

      {
        title: "Branch",
        component: (
          <StepBranch
            data={state.data}
            updateData={updateData}
          />
        ),
      },

      {
        title: "Owner",
        component: (
          <StepOwner
            data={state.data}
            updateData={updateData}
          />
        ),
      },

      {
        title: "Preferences",
        component: (
          <StepPreferences
            data={state.data}
            updateData={updateData}
            currencies={currencies}
            countries={countries}
          />
        ),
      },

      {
        title: "Review",
        component: (
          <StepReview
            data={state.data}
          />
        ),
      },

    ],
    [
      state.data,
      updateData,
      currencies,
      countries,
    ],
  );



  const handleNext = async () => {

    setError(null);


    if (!isLastStep) {

      nextStep();

      return;

    }


    try {
      setLoading(true);
      const validatedData = businessSetupSchema.parse(state.data);
      await createBusinessAction(validatedData);
      // Server action redirects to /dashboard on success
    } catch (error) {
      // Next.js redirect() throws a special error — let it through
      const dig = (error as { digest?: string })?.digest ?? "";
      if (
        dig.startsWith("NEXT_REDIRECT") ||
        (error instanceof Error && error.message === "NEXT_REDIRECT")
      ) {
        throw error;
      }
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create business.",
      );
      setLoading(false);
    }

  };



  const current =
    steps[state.currentStep];



  return (

    <SetupShell

      title="Create Your Business"

      subtitle="Let's configure your ERP workspace."


      progress={

        <SetupProgress

          steps={
            steps.map(
              (step) => step.title,
            )
          }


          currentStep={
            state.currentStep
          }

        />

      }



      navigation={

        <SetupNavigation

          onBack={
            previousStep
          }


          onNext={
            handleNext
          }


          disableBack={
            isFirstStep ||
            loading
          }


          disableNext={
            loading
          }


          nextLabel={
            loading
              ? "Creating..."
              : isLastStep
                ? "Create Business"
                : "Next"
          }

        />

      }

    >


      {error && (

        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-400/30
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-200
          "
        >

          {error}

        </div>

      )}


      {current.component}


    </SetupShell>

  );

}
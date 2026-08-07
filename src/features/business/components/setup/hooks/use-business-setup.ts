"use client";

import { useState } from "react";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";


export type BusinessSetupState = {

  currentStep: number;

  data: Partial<BusinessSetupInput>;

};


export function useBusinessSetup() {

  const [state, setState] =
    useState<BusinessSetupState>({

      currentStep: 0,

      data: {
        country: "Kenya",
        currency: "KES",
        timezone: "Africa/Nairobi",
      },

    });


  const updateData = (
    data: Partial<BusinessSetupInput>,
  ) => {

    setState((previous) => ({

      ...previous,

      data: {
        ...previous.data,
        ...data,
      },

    }));

  };


  const nextStep = () => {

    setState((previous) => ({

      ...previous,

      currentStep: Math.min(
        previous.currentStep + 1,
        4,
      ),

    }));

  };


  const previousStep = () => {

    setState((previous) => ({

      ...previous,

      currentStep: Math.max(
        previous.currentStep - 1,
        0,
      ),

    }));

  };


  const goToStep = (
    step: number,
  ) => {

    setState((previous) => ({

      ...previous,

      currentStep: step,

    }));

  };


  return {

    state,

    updateData,

    nextStep,

    previousStep,

    goToStep,


    isFirstStep:
      state.currentStep === 0,


    isLastStep:
      state.currentStep === 4,

  };

}
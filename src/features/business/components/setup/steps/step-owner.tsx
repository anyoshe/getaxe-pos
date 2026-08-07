"use client";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";


type StepOwnerProps = {

  data: Partial<BusinessSetupInput>;

  updateData: (
    data: Partial<BusinessSetupInput>,
  ) => void;

};


export function StepOwner({
  data,
}: StepOwnerProps) {

  return (

    <div className="space-y-6">

      <div className="space-y-2">

        <h2
          className="
            text-2xl
            font-semibold
            text-white
          "
        >
          Business Owner
        </h2>

        <p
          className="
            text-sm
            text-white/70
          "
        >
          Your account will become the administrator
          of this business.
        </p>

      </div>


      <div
        className="
          rounded-2xl
          border
          border-white/20
          bg-white/10
          p-6
        "
      >

        <p className="text-white/70 text-sm">
          Owner information is linked from your
          authenticated account.
        </p>

        <p className="mt-3 text-white font-medium">
          {data.email ?? "Account owner"}
        </p>

      </div>


    </div>

  );

}
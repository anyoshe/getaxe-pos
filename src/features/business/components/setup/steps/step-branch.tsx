"use client";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";


type StepBranchProps = {

  data: Partial<BusinessSetupInput>;

  updateData: (
    data: Partial<BusinessSetupInput>,
  ) => void;

};


export function StepBranch({
  data,
  updateData,
}: StepBranchProps) {

  return (

    <div className="space-y-6">

      <div className="space-y-2">

        <h2 className="text-2xl font-semibold text-white">
          Main Branch
        </h2>

        <p className="text-sm text-white/70">
          Configure your first business location.
        </p>

      </div>


      <div className="grid gap-5">


        <input
          value={data.county ?? ""}
          onChange={(e) =>
            updateData({
              county: e.target.value,
            })
          }
          placeholder="County"
          className="
            rounded-xl
            border
            border-white/20
            bg-white/10
            px-4
            py-3
            text-white
            placeholder:text-white/40
          "
        />


        <input
          value={data.town ?? ""}
          onChange={(e) =>
            updateData({
              town: e.target.value,
            })
          }
          placeholder="Town"
          className="
            rounded-xl
            border
            border-white/20
            bg-white/10
            px-4
            py-3
            text-white
            placeholder:text-white/40
          "
        />


        <textarea
          value={data.address ?? ""}
          onChange={(e) =>
            updateData({
              address: e.target.value,
            })
          }
          placeholder="Address"
          className="
            rounded-xl
            border
            border-white/20
            bg-white/10
            px-4
            py-3
            text-white
            placeholder:text-white/40
          "
        />


      </div>

    </div>

  );

}
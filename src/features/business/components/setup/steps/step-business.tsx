"use client";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";

import {
  BUSINESS_TYPES,
} from "../../../constants/business-types";

type StepBusinessProps = {
  data: Partial<BusinessSetupInput>;

  updateData: (
    data: Partial<BusinessSetupInput>,
  ) => void;
};

export function StepBusiness({
  data,
  updateData,
}: StepBusinessProps) {
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
          Business Information
        </h2>

        <p
          className="
            text-sm
            text-white/70
          "
        >
          Tell us about your business.
        </p>

      </div>

      <div className="grid gap-5">

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            Business Name
          </label>

          <input
            value={data.name ?? ""}

            onChange={(event) =>
              updateData({
                name: event.target.value,
              })
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-card/10
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-indigo-400
            "

            placeholder="Enter business name"
          />

        </div>

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            Legal Name
          </label>

          <input
            value={data.legalName ?? ""}

            onChange={(event) =>
              updateData({
                legalName: event.target.value,
              })
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-card/10
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-indigo-400
            "

            placeholder="Registered legal name"
          />

        </div>

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            Registration Number
          </label>

          <input
            value={data.registrationNumber ?? ""}

            onChange={(event) =>
              updateData({
                registrationNumber: event.target.value,
              })
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-card/10
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-indigo-400
            "

            placeholder="Company registration number"
          />

        </div>

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            KRA PIN
          </label>

          <input
            value={data.kraPin ?? ""}

            onChange={(event) =>
              updateData({
                kraPin: event.target.value,
              })
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-card/10
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-indigo-400
            "

            placeholder="KRA PIN"
          />

        </div>

        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            Business Type
          </label>

          <select
            value={data.businessType ?? ""}

            onChange={(event) =>
              updateData({
                businessType:
                  event.target.value as BusinessSetupInput["businessType"],
              })
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-card/10
              px-4
              py-3
              text-white
              outline-none
              focus:border-indigo-400
            "
          >

            <option
              value=""
              className="text-foreground"
            >
              Select business type
            </option>

            {BUSINESS_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
                className="text-foreground"
              >
                {type.label}
              </option>
            ))}

          </select>

        </div>

      </div>

    </div>
  );
}
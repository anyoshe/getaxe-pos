"use client";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";


type StepReviewProps = {

  data: Partial<BusinessSetupInput>;

};


export function StepReview({
  data,
}: StepReviewProps) {

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
          Review
        </h2>

        <p
          className="
            text-sm
            text-white/70
          "
        >
          Confirm your business details before
          creating your ERP workspace.
        </p>

      </div>


      <div
        className="
          rounded-2xl
          border
          border-white/20
          bg-card/10
          p-6
          space-y-4
        "
      >

        <ReviewRow
          label="Business Name"
          value={data.name}
        />

        <ReviewRow
          label="Business Type"
          value={data.businessType}
        />

        <ReviewRow
          label="County"
          value={data.county}
        />

        <ReviewRow
          label="Town"
          value={data.town}
        />

        <ReviewRow
          label="Currency"
          value={data.currency}
        />

        <ReviewRow
          label="Timezone"
          value={data.timezone}
        />


      </div>


    </div>

  );

}


function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {

  return (

    <div
      className="
        flex
        justify-between
        gap-4
        text-sm
      "
    >

      <span
        className="
          text-white/60
        "
      >
        {label}
      </span>


      <span
        className="
          text-white
          font-medium
        "
      >
        {value || "-"}
      </span>


    </div>

  );

}
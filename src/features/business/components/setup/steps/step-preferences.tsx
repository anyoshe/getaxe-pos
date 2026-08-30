"use client";

import type {
  BusinessSetupInput,
} from "../../../schemas/business-setup-schema";


type StepPreferencesProps = {

  data: Partial<BusinessSetupInput>;

  updateData: (
    data: Partial<BusinessSetupInput>,
  ) => void;


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


export function StepPreferences({
  data,
  updateData,
  currencies,
  countries,
}: StepPreferencesProps) {

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
          Business Preferences
        </h2>

        <p
          className="
            text-sm
            text-white/70
          "
        >
          Configure your default ERP settings.
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
            Currency
          </label>


          <select
            value={
              data.currency ?? "KES"
            }

            onChange={(event) =>
              updateData({
                currency:
                  event.target.value,
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
            "
          >

            {currencies.map((currency) => (

              <option
                key={currency.id}
                value={currency.code}
                className="text-foreground"
              >

                {currency.symbol} {currency.code} - {currency.name}

              </option>

            ))}

          </select>

        </div>


        <div className="space-y-2">

          <label
            className="
              text-sm
              text-white/80
            "
          >
            Timezone
          </label>

          <select
            value={
              data.timezone ?? "Africa/Nairobi"
            }

            onChange={(event) =>
              updateData({
                timezone:
                  event.target.value,
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
          "
          >

            {countries
              .filter(
                (country) =>
                  country.timezone,
              )
              .map((country) => (

                <option
                  key={country.id}
                  value={country.timezone!}
                  className="text-foreground"
                >

                  {country.name} ({country.timezone})

                </option>

              ))}

          </select>

        </div>


      </div>


    </div>

  );

}
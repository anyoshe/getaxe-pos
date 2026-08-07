"use client";

type SetupProgressProps = {
  steps: string[];
  currentStep: number;
};

export function SetupProgress({
  steps,
  currentStep,
}: SetupProgressProps) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-2
      "
    >

      {steps.map((step, index) => {

        const completed =
          index < currentStep;

        const active =
          index === currentStep;

        return (

          <div
            key={step}
            className="
              flex
              flex-1
              items-center
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
                gap-2
              "
            >

              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  transition-all
                  duration-300

                  ${
                    completed
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : active
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-white/20 bg-white/10 text-white/60"
                  }
                `}
              >

                {completed
                  ? "✓"
                  : index + 1}

              </div>

              <span
                className={`
                  text-xs
                  text-center
                  transition-colors
                  duration-300

                  ${
                    active
                      ? "text-white"
                      : "text-white/60"
                  }
                `}
              >

                {step}

              </span>

            </div>

            {index < steps.length - 1 && (

              <div
                className={`
                  mx-2
                  h-[2px]
                  flex-1
                  transition-colors
                  duration-300

                  ${
                    completed
                      ? "bg-cyan-400"
                      : "bg-white/10"
                  }
                `}
              />

            )}

          </div>

        );

      })}

    </div>

  );

}
"use client";

type SetupNavigationProps = {
  backLabel?: string;
  nextLabel: string;

  onBack: () => void;
  onNext: () => void;

  disableBack?: boolean;
  disableNext?: boolean;
};

export function SetupNavigation({
  backLabel = "Back",
  nextLabel,

  onBack,
  onNext,

  disableBack = false,
  disableNext = false,
}: SetupNavigationProps) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <button
        type="button"
        onClick={onBack}
        disabled={disableBack}
        className="
          rounded-xl
          border
          border-white/15
          px-6
          py-3

          text-sm
          font-medium
          text-white

          transition-all
          duration-200

          hover:bg-white/10

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >

        ← {backLabel}

      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className="
          rounded-xl

          bg-gradient-to-r
          from-indigo-600
          to-cyan-500

          px-8
          py-3

          text-sm
          font-semibold
          text-white

          shadow-lg

          transition-all
          duration-300

          hover:scale-[1.02]
          hover:shadow-cyan-500/30

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >

        {nextLabel} →

      </button>

    </div>

  );

}
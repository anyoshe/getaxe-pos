"use client";

import { Check } from "lucide-react";

interface RememberCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;

  label?: string;

  disabled?: boolean;
}

export function RememberCheckbox({
  checked,
  onCheckedChange,
  label = "Remember me",
  disabled = false,
}: RememberCheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className="
        flex
        items-center
        gap-3

        text-sm
        text-white/80

        transition-all
        duration-200

        hover:text-white

        disabled:cursor-not-allowed
        disabled:opacity-50

        focus:outline-none
      "
    >
      <div
        className={`
          flex
          h-5
          w-5
          items-center
          justify-center

          rounded-md
          border

          transition-all
          duration-200

          ${
            checked
              ? `
                border-cyan-400
                bg-cyan-500
                shadow-md
                shadow-cyan-500/40
              `
              : `
                border-white/30
                bg-white/10
              `
          }
        `}
      >
        <Check
          size={14}
          className={`
            transition-all
            duration-200

            ${
              checked
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0"
            }

            text-white
          `}
        />
      </div>

      <span>{label}</span>
    </button>
  );
}
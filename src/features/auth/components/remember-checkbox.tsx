"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function RememberCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className="flex items-center gap-3 text-sm text-white/80"
    >
      <div
        className={`
          flex h-5 w-5 items-center justify-center rounded-md border transition-all
          ${
            checked
              ? "border-cyan-400 bg-cyan-500"
              : "border-white/30 bg-white/10"
          }
        `}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </div>

      <span>Remember me</span>
    </button>
  );
}
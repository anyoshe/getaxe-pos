import {
  ShieldCheck,
  Package,
  ShoppingCart,
  BarChart3,
  Hospital,
  Cpu,
} from "lucide-react";

import { FadeIn, Stagger } from "@/components/motion";

const features = [
  { icon: ShoppingCart, label: "Sales" },
  { icon: Package, label: "Inventory" },
  { icon: Hospital, label: "Clinical" },
  { icon: BarChart3, label: "Reports" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: Cpu, label: "AI Ready" },
];

export function LoginSidePanel() {
  return (
    <Stagger
      stagger={0.18}
      className="flex h-full flex-col justify-center"
    >
      <FadeIn
        staggerChild
        direction="up"
      >
        <h1 className="text-6xl font-black text-white">
          GetAxe POS
        </h1>
      </FadeIn>

      <FadeIn
        staggerChild
        direction="up"
      >
        <p className="mt-6 max-w-xl text-xl leading-8 text-white/75">
          A modern business platform built to manage retail,
          pharmacy, healthcare and finance in one place.
        </p>
      </FadeIn>

      <FadeIn
        staggerChild
        direction="up"
      >
        <div className="mt-12 flex flex-wrap gap-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="
                flex items-center gap-2
                rounded-full
                border
                border-white/20
                bg-white/10
                px-5
                py-3
                backdrop-blur-xl
              "
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <span className="text-white">
                {label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </Stagger>
  );
}
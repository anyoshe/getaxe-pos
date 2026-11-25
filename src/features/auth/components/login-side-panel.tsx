import {
  Eye,
  Shield,
  LineChart,
  Store,
  Package,
  Banknote,
} from "lucide-react";

import { FadeIn, Stagger } from "@/components/motion";

const pillars = [
  { icon: Eye, label: "Know" },
  { icon: Shield, label: "Control" },
  { icon: LineChart, label: "Decide" },
  { icon: Store, label: "Grow" },
];

const proof = [
  { icon: Package, label: "Stock & sales" },
  { icon: Banknote, label: "Cash & profits" },
];

/** Desktop-only marketing column — kept short and scannable. */
export function LoginSidePanel() {
  return (
    <Stagger stagger={0.12} className="flex h-full max-w-lg flex-col justify-center py-8">
      <FadeIn staggerChild direction="up">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/90">
          Business management
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-white xl:text-5xl">
          Know. Control.
          <br />
          Decide. Grow.
        </h1>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <p className="mt-5 text-lg leading-7 text-white/75">
          See stock, sales and cash clearly — so decisions are based on facts,
          not guesswork.
        </p>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <div className="mt-8 flex flex-wrap gap-2">
          {pillars.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-card/10 px-4 py-2 backdrop-blur-xl"
            >
              <Icon className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {proof.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/85"
            >
              <Icon className="h-3.5 w-3.5 text-cyan-200/90" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-white/50">
          Pharmacy · Spare parts · Hardware · Retail
        </p>
      </FadeIn>
    </Stagger>
  );
}

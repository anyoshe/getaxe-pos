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

export function LoginSidePanel() {
  return (
    <Stagger stagger={0.18} className="flex h-full flex-col justify-center">
      <FadeIn staggerChild direction="up">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300/90">
          GetAxe Business Management
        </p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
          Know. Control.
          <br />
          Decide. Grow.
        </h1>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <p className="mt-6 max-w-xl text-xl leading-8 text-white/80">
          Your business shouldn&apos;t depend on guesswork — or on you being at
          the counter every minute. See stock, sales, cash and what needs
          attention so you can make decisions with facts.
        </p>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <div className="mt-10 flex flex-wrap gap-3">
          {pillars.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-card/10 px-5 py-3 backdrop-blur-xl"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <span className="font-medium text-white">{label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn staggerChild direction="up">
        <div className="mt-6 flex flex-wrap gap-3">
          {proof.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
            >
              <Icon className="h-4 w-4 text-cyan-200/90" />
              <span>{label}</span>
            </div>
          ))}
          <span className="self-center text-sm text-white/60">
            Pharmacy · Spare parts · Hardware · Retail
          </span>
        </div>
      </FadeIn>
    </Stagger>
  );
}

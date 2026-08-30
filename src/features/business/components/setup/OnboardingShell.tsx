import type {
  ReactNode,
} from "react";

type OnboardingCardProps = {

  children: ReactNode;

};

export function OnboardingCard({
  children,
}: OnboardingCardProps) {

  return (


<div
  className="
    w-full
    h-full
    max-w-7xl

    rounded-3xl

    border
    border-white/20

    bg-card/10
    backdrop-blur-2xl

    shadow-2xl

    p-10
  "
>

      {children}

    </div>

  );

}
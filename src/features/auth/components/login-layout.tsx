import type { ReactNode } from "react";

import { FadeIn } from "@/components/motion";

import { AnimatedBackground } from "./animated-background";
import { LoginCard } from "./login-card";
import { LoginSidePanel } from "./login-side-panel";

type LoginLayoutProps = {
  children?: ReactNode;
};

/**
 * Auth shell: full marketing panel on large screens; clean centered card on mobile.
 */
export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 lg:grid-cols-12">
        {/* Marketing — desktop only */}
        <section className="hidden lg:col-span-5 lg:flex lg:items-center lg:px-10 xl:px-14">
          <LoginSidePanel />
        </section>

        {/* Form — full width on phone, right column on desktop */}
        <section className="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:col-span-7 lg:px-10 lg:py-12">
          <FadeIn
            delay={0.15}
            duration={0.5}
            className="w-full max-w-md"
          >
            {children ?? <LoginCard />}
          </FadeIn>
        </section>
      </div>
    </main>
  );
}

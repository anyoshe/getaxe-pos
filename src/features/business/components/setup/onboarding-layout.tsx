"use client";

import type {
  ReactNode,
} from "react";

import { FadeIn } from "@/components/motion";

import { AnimatedBackground } from "@/features/auth/components/animated-background";
import { LoginSidePanel } from "@/features/auth/components/login-side-panel";

type OnboardingLayoutProps = {

  children: ReactNode;

};

export function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {

  return (

    <main className="relative min-h-screen overflow-hidden">

      <AnimatedBackground />

      <div
        className="
            relative
            z-10
            grid
            h-screen
            grid-cols-1
            lg:grid-cols-12
        "
        >

        <section
          className="
            hidden
            lg:flex
            lg:col-span-4
            px-16
          "
        >

          <LoginSidePanel />

        </section>

        <section
            className="
                flex
                items-center
                justify-center

                px-6
                py-10

                md:px-6

                lg:col-span-8
                lg:px-10
            "
            >

          <FadeIn
            delay={0.25}
            duration={0.8}
            className="
              w-full
              max-w-5xl
            "
          >

            {children}

          </FadeIn>

        </section>

      </div>

    </main>

  );

}
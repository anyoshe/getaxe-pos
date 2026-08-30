"use client";

import type { ReactNode } from "react";

import { FadeIn } from "@/components/motion";

type SetupShellProps = {
    title: string;
    subtitle: string;

    progress: ReactNode;

    children: ReactNode;

    navigation: ReactNode;
};

export function SetupShell({
    title,
    subtitle,
    progress,
    children,
    navigation,
}: SetupShellProps) {

    return (

        <FadeIn
            delay={0.2}
            duration={0.5}
        >

         <div
        className="
            w-full
            max-h-[calc(100vh-5rem)]

            flex
            flex-col

            rounded-3xl
            border
            border-white/20
            bg-card/10
            backdrop-blur-2xl
            shadow-2xl
            overflow-hidden
        "
        >

                <div
                    className="
            border-b
            border-white/10
            px-8
            py-8
            text-center
          "
                >

                    <h1
                        className="
              text-3xl
              font-bold
              text-white
            "
                    >
                        {title}
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-white/70
                            "
                    >
                        {subtitle}
                    </p>

                </div>

                <div className="px-8 pt-8">

                    {progress}

                </div>

                <div
                
                    className="
                        flex-1
                        min-h-0
                        overflow-y-auto

                        px-8
                        py-8
                    "
                >
            
            
                    {children}

                </div>

                <div
                    className="
            border-t
            border-white/10
            px-8
            py-6
          "
                >

                    {navigation}

                </div>

            </div>

        </FadeIn>

    );

}
import { AnimatedBackground } from "./animated-background";
import { LoginCard } from "./login-card";
import { LoginSidePanel } from "./login-side-panel";
import { FadeIn } from "@/components/motion";

export function LoginLayout() {
    return (
        <main className="relative min-h-screen overflow-hidden">

            <AnimatedBackground />

            <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-12">

              <section className="hidden lg:flex lg:col-span-5 px-16">
                    <LoginSidePanel />
                </section>

                <section
                    className="
                        flex
                        items-center
                        justify-center
                        px-10
                        py-10
                        lg:col-span-7
                    "
                >
                    <FadeIn
                        delay={0.3}
                        duration={0.8}
                        className="w-full max-w-md translate-x-6"
                    >
                        <LoginCard />
                    </FadeIn>
                </section>
            </div>

        </main>
    );
}
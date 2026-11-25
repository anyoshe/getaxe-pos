import type { ReactNode } from "react";

import { LoginHeader } from "./login-header";
import { LoginForm } from "./login-form";

type LoginCardProps = {
  header?: ReactNode;
  children?: ReactNode;
};

export function LoginCard({ header, children }: LoginCardProps) {
  return (
    <div
      className="
        w-full
        rounded-2xl
        border border-white/15
        bg-card/15
        p-5 shadow-xl backdrop-blur-xl
        sm:rounded-3xl sm:p-8
        md:p-10
      "
    >
      {header ?? <LoginHeader />}

      <div className="mt-6 sm:mt-8">{children ?? <LoginForm />}</div>

      <div className="mt-6 border-t border-white/10 pt-4 text-center sm:mt-8 sm:pt-5">
        <p className="text-[11px] text-white/45 sm:text-xs">
          © GetAxe Technologies
        </p>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

type AuthCardProps = {
  header: ReactNode;
  children: ReactNode;
};

export function AuthCard({ header, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-card/15 p-5 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-8 md:p-10">
      {header}
      <div className="mt-6 sm:mt-8">{children}</div>
      <div className="mt-6 border-t border-white/10 pt-4 text-center sm:mt-8">
        <p className="text-[11px] text-white/45 sm:text-xs">© GetAxe Technologies</p>
      </div>
    </div>
  );
}

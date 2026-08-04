import type {
  ReactNode,
} from "react";

type AuthCardProps = {

  header: ReactNode;

  children: ReactNode;

};

export function AuthCard({
  header,
  children,
}: AuthCardProps) {

  return (

    <div
      className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/20
        bg-white/10
        backdrop-blur-2xl
        shadow-2xl
        p-10
      "
    >

      {header}

      <div className="mt-10">
        {children}
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center">

        <p className="text-xs text-white/50">
          Version 1.0 • © GetAxe Technologies
        </p>

      </div>

    </div>

  );

}
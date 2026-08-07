import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({
  compact = false,
}: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className="
        flex
        items-center
        gap-3
        group
      "
    >

      <div
        className="
          relative
          h-12
          w-12
          shrink-0
          rounded-xl
          bg-white
          p-1
          shadow-sm
          ring-1
          ring-slate-200
          transition
          group-hover:shadow-md
        "
      >
        <Image
          src="/gat-icon1.svg"
          alt="GetAxe"
          fill
          priority
          className="
            object-contain
            p-1
          "
        />
      </div>


      {!compact && (
        <div className="leading-tight">

          <h1
            className="
              text-base
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            GetAxe Technologies
          </h1>


          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Business Management Platform
          </p>

        </div>
      )}

    </Link>
  );
}
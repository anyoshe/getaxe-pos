import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-3"
    >
      <div
        className="
          relative h-12 w-12 shrink-0 rounded-xl bg-white p-1 shadow-sm
          ring-1 ring-primary/15 transition group-hover:shadow-md
        "
      >
        <Image
          src="/gat-icon1.svg"
          alt="GetAxe"
          fill
          priority
          className="object-contain p-1"
        />
      </div>

      {!compact && (
        <div className="leading-tight">
          <p className="max-w-[9.5rem] text-xs font-medium leading-snug tracking-wide text-muted-foreground">
            Business Management Solution
          </p>
        </div>
      )}
    </Link>
  );
}

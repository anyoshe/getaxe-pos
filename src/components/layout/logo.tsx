import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3"
    >
      <div className="relative h-16 w-16 shrink-0">
        <Image
          src="/gat-icon1.svg"
          alt="GetAxe POS"
          fill
          priority
          className="object-contain"
        />
      </div>

      {!compact && (
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            GetAxe POS
          </h1>

          <p className="text-xs text-slate-500">
            Smart Retail Platform
          </p>
        </div>
      )}
    </Link>
  );
}
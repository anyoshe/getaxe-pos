import Image from "next/image";

export function LoginHeader() {
  return (
    <div className="space-y-3 text-center sm:space-y-4">
      <Image
        src="/gat-icon1.svg"
        alt="GetAxe"
        width={56}
        height={56}
        className="mx-auto h-12 w-12 sm:h-14 sm:w-14"
        priority
      />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300/90 sm:text-xs">
          GetAxe
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-white/65 sm:mt-2 sm:text-base">
          Sign in to your business
        </p>
      </div>
    </div>
  );
}

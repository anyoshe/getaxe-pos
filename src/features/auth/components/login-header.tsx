import Image from "next/image";

export function LoginHeader() {
  return (
    <div className="space-y-5 text-center">

      <Image
        src="/gat-icon1.svg"
        alt="GetAxe"
        width={70}
        height={70}
        className="mx-auto"
      />

      <div>

        <h1 className="text-3xl font-bold text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-white/70">
          Sign in to continue managing your business.
        </p>

      </div>

    </div>
  );
}
import Image from "next/image";

export function CreatePasswordHeader() {

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
          Create Password
        </h1>

        <p className="mt-2 text-white/70">
          Create a secure password to activate your ERP account.
        </p>

      </div>

    </div>

  );

}
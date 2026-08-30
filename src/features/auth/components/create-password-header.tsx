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
          Choose your password
        </h1>

        <p className="mt-2 text-white/70">
          Replace the temporary password with one you will remember, then continue to business setup.
        </p>

      </div>

    </div>

  );

}
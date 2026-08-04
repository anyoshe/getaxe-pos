"use client";

import {
  useState,
} from "react";

import {
  platformLogin,
} from "../actions/platform-login";


export function PlatformLoginForm() {

  const [error,setError] =
    useState("");



  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ){

    e.preventDefault();


    const form =
      new FormData(e.currentTarget);



    const result =
      await platformLogin(
        String(form.get("email")),
        String(form.get("password")),
      );


    if(!result.success){

      setError(result.message);

    }

  }



  return (

    <form
      onSubmit={submit}
      className="mx-auto mt-20 max-w-md space-y-4"
    >

      <h1 className="text-2xl font-bold">
        GetAxe Platform Login
      </h1>


      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full rounded border p-3"
        required
      />


      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full rounded border p-3"
        required
      />


      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}


      <button
        className="
          w-full
          rounded
          bg-indigo-600
          p-3
          text-white
        "
      >
        Login
      </button>


    </form>

  );

}
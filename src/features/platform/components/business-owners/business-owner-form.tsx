"use client";

import {
  useState,
} from "react";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Button,
} from "@/components/ui/button";

import {
  toast,
} from "sonner";

import {
  createBusinessOwnerAction,
} from "../../actions";


interface BusinessOwnerFormProps {

  onSuccess?: () => void;

}


export function BusinessOwnerForm({
  onSuccess,
}: BusinessOwnerFormProps) {


  const [loading, setLoading] =
    useState(false);



  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();


    const formData =
      new FormData(
        event.currentTarget,
      );


    setLoading(true);


    const result =
      await createBusinessOwnerAction(
        formData,
      );


    setLoading(false);



    if (result.success) {

      toast.success(
        "Business owner created successfully.",
      );

      onSuccess?.();

      return;

    }


    toast.error(
      "Failed to create business owner.",
    );

  }



  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <div className="space-y-2">

        <Label htmlFor="name">
          Full Name
        </Label>

        <Input
          id="name"
          name="name"
          placeholder="Enter full name"
          required
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="email">
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email address"
          required
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="phone">
          Phone Number
        </Label>

        <Input
          id="phone"
          name="phone"
          placeholder="Enter phone number"
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="password">
          Temporary Password
        </Label>

        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create temporary password"
          required
        />

      </div>


      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >

        {
          loading
            ? "Creating..."
            : "Create Business Owner"
        }

      </Button>


    </form>

  );
}
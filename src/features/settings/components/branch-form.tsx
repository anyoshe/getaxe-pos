"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  FormActions,
} from "@/components/crud";

import { z } from "zod";

const branchFormSchema =
  z.object({

    code: z.string()
      .trim()
      .min(2),

    name: z.string()
      .trim()
      .min(2),

    phone: z.string()
      .optional()
      .nullable(),

    email: z.string()
      .optional()
      .nullable(),

    county: z.string()
      .optional()
      .nullable(),

    town: z.string()
      .optional()
      .nullable(),

    address: z.string()
      .optional()
      .nullable(),

    active: z.boolean(),

    isHeadOffice: z.boolean(),

  });


type BranchFormInput =
  z.infer<typeof branchFormSchema>;

import {
  createBranchAction,
} from "../actions/create-branch";

import {
  updateBranchAction,
} from "../actions/update-branch";

import type { Branch } from "../types";

interface BranchFormProps {
  branch?: Branch | null;

  onSuccess?: () => void;
}


export function BranchForm({
  branch,
  onSuccess,
}: BranchFormProps) {

  const [pending, startTransition] =
    useTransition();


  const form =
    useForm<BranchFormInput>({
      resolver:
        zodResolver(branchFormSchema),

      defaultValues: {
        code: branch?.code ?? "",
        name: branch?.name ?? "",
        phone: branch?.phone ?? "",
        email: branch?.email ?? "",
        county: branch?.county ?? "",
        town: branch?.town ?? "",
        address: branch?.address ?? "",
        active: branch?.active ?? true,
        isHeadOffice: branch?.isHeadOffice ?? false,
      },
    });

  useEffect(() => {
    form.reset({
      code: branch?.code ?? "",
      name: branch?.name ?? "",
      phone: branch?.phone ?? "",
      email: branch?.email ?? "",
      county: branch?.county ?? "",
      town: branch?.town ?? "",
      address: branch?.address ?? "",
      active: branch?.active ?? true,
      isHeadOffice: branch?.isHeadOffice ?? false,
    });
  }, [branch, form]);
  function onSubmit(
    values: BranchFormInput
  ) {

    startTransition(async () => {

      const formData = new FormData();

      Object.entries(values)
        .forEach(([key, value]) => {

          formData.append(
            key,
            String(value)
          );

        });
      let result;

      if (branch) {
        result = await updateBranchAction(
          branch.id,
          formData
        );
      } else {
        result = await createBranchAction(
          formData
        );
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      form.reset();

      onSuccess?.();

    });

  }


  return (
    <form
      onSubmit={
        form.handleSubmit(onSubmit)
      }
      className="space-y-4"
    >

      <Input
        placeholder="Branch Code"
        {...form.register("code")}
      />

      <Input
        placeholder="Branch Name"
        {...form.register("name")}
      />

      <Input
        placeholder="Phone"
        {...form.register("phone")}
      />

      <Input
        placeholder="Email"
        {...form.register("email")}
      />

      <Input
        placeholder="County"
        {...form.register("county")}
      />

      <Input
        placeholder="Town"
        {...form.register("town")}
      />

      <Input
        placeholder="Address"
        {...form.register("address")}
      />


      <FormActions
        loading={pending}
        submitLabel={
          branch
            ? "Update Branch"
            : "Create Branch"
        }
      />

    </form>
  );
}
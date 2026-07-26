"use client";

import {
  useEffect,
  useTransition,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { z } from "zod";

import { Input } from "@/components/ui/input";

import {
  FormActions,
} from "@/components/crud";

import {
  createUnitAction,
} from "../../actions/create-unit";

import {
  updateUnitAction,
} from "../../actions/update-unit";

import type {
  Unit,
} from "../../types";


const unitFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1),

  name: z
    .string()
    .trim()
    .min(1),

  symbol: z
    .string()
    .optional()
    .nullable(),

  description: z
    .string()
    .optional()
    .nullable(),

  active: z.boolean(),
});


type UnitFormInput =
  z.infer<typeof unitFormSchema>;


interface UnitFormProps {
  unit?: Unit | null;

  onSuccess?: () => void;
}


export function UnitForm({
  unit,
  onSuccess,
}: UnitFormProps) {

  const [pending, startTransition] =
    useTransition();


  const form =
    useForm<UnitFormInput>({
      resolver:
        zodResolver(
          unitFormSchema
        ),

      defaultValues: {
        code:
          unit?.code ?? "",

        name:
          unit?.name ?? "",

        symbol:
          unit?.symbol ?? "",

        description:
          unit?.description ?? "",

        active:
          unit?.active ?? true,
      },
    });


  useEffect(() => {

    form.reset({

      code:
        unit?.code ?? "",

      name:
        unit?.name ?? "",

      symbol:
        unit?.symbol ?? "",

      description:
        unit?.description ?? "",

      active:
        unit?.active ?? true,

    });

  }, [unit, form]);


  function onSubmit(
    values: UnitFormInput
  ) {

    startTransition(async () => {

      const formData =
        new FormData();


      Object.entries(values)
        .forEach(([key, value]) => {

          formData.append(
            key,
            String(value ?? "")
          );

        });


      let result;


      if (unit) {

        result =
          await updateUnitAction(
            unit.id,
            formData
          );

      } else {

        result =
          await createUnitAction(
            formData
          );

      }


      if (!result.success) {

        toast.error(
          result.message ??
          "Operation failed."
        );

        return;
      }


      toast.success(
        result.message
      );


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
        placeholder="Unit Code"
        {...form.register("code")}
      />


      <Input
        placeholder="Unit Name"
        {...form.register("name")}
      />


      <Input
        placeholder="Symbol (kg, pcs, L)"
        {...form.register("symbol")}
      />


      <Input
        placeholder="Description"
        {...form.register("description")}
      />


      <FormActions
        loading={pending}
        submitLabel={
          unit
            ? "Update Unit"
            : "Create Unit"
        }
      />

    </form>
  );
}
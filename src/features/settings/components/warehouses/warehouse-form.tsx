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
  createWarehouseAction,
} from "../../actions/create-warehouse";

import {
  updateWarehouseAction,
} from "../../actions/update-warehouse";

import {
  createWarehouseSchema,
} from "../../schemas/warehouse";


import type {
  Warehouse,
  Branch,
} from "../../types";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const warehouseFormSchema = z.object({
  branchId: z.string().uuid(),
  code: z.string().trim().min(2),
  name: z.string().trim().min(2),
  description: z.string().optional().nullable(),
  active: z.boolean(),
});

type WarehouseFormInput =
  z.infer<typeof warehouseFormSchema>;



interface WarehouseFormProps {
  warehouse?: Warehouse | null;

  branches: Branch[];

  onSuccess?: () => void;
}
export function WarehouseForm({
  warehouse,
  branches,
  onSuccess,
}: WarehouseFormProps) {

  const [pending, startTransition] =
    useTransition();

  const form =
    useForm<WarehouseFormInput>({
      resolver:
        zodResolver(
          warehouseFormSchema
        ),

      defaultValues: {
        branchId:
          warehouse?.branchId ?? "",

        code:
          warehouse?.code ?? "",

        name:
          warehouse?.name ?? "",

        description:
          warehouse?.description ?? "",

        active:
          warehouse?.active ?? true,
      },
    });

  useEffect(() => {

    form.reset({
      branchId:
        warehouse?.branchId ?? "",

      code:
        warehouse?.code ?? "",

      name:
        warehouse?.name ?? "",

      description:
        warehouse?.description ?? "",

      active:
        warehouse?.active ?? true,
    });

  }, [warehouse, form]);

  function onSubmit(
    values: WarehouseFormInput
  ) {

    startTransition(async () => {

      const formData =
        new FormData();

      Object.entries(values)
        .forEach(([key, value]) => {

          formData.append(
            key,
            String(value)
          );

        });

      let result;

      if (warehouse) {

        result =
          await updateWarehouseAction(
            warehouse.id,
            formData
          );

      } else {

        result =
          await createWarehouseAction(
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

      <Select
        value={form.watch("branchId")}
        onValueChange={(value) =>
          value &&
          form.setValue("branchId", value)
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {branches.find(
              (b) => b.id === form.watch("branchId")
            )?.code}{" "}
            -{" "}
            {branches.find(
              (b) => b.id === form.watch("branchId")
            )?.name ?? "Select Branch"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {branches.map((branch) => (
            <SelectItem
              key={branch.id}
              value={branch.id}
            >
              {branch.code} - {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Warehouse Code"
        {...form.register("code")}
      />



      <Input
        placeholder="Warehouse Name"
        {...form.register("name")}
      />


      <Input
        placeholder="Description"
        {...form.register("description")}
      />



      <FormActions
        loading={pending}
        submitLabel={
          warehouse
            ? "Update Warehouse"
            : "Create Warehouse"
        }
      />
    </form>
  );
}
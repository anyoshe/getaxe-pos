"use client";

import { Plus } from "lucide-react";

import {
  CrudToolbar,
} from "@/components/crud";

import {
  Button,
} from "@/components/ui/button";

interface SupplierToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function SupplierToolbar({
  search,
  onSearchChange,
  onCreate,
}: SupplierToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
      createButton={
        <Button
          onClick={onCreate}
          className="
            rounded-2xl
            bg-gradient-to-r
            from-indigo-600
            to-violet-600
            hover:from-indigo-700
            hover:to-violet-700
          "
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      }
    />
  );
}
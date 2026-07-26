"use client";

import { Button } from "@/components/ui/button";

import {
  CrudToolbar,
} from "@/components/crud";

interface WarehouseToolbarProps {
  search: string;

  onSearchChange: (
    value: string
  ) => void;

  onCreate: () => void;
}

export function WarehouseToolbar({
  search,
  onSearchChange,
  onCreate,
}: WarehouseToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
      createButton={
        <Button onClick={onCreate}>
          New Warehouse
        </Button>
      }
    />
  );
}
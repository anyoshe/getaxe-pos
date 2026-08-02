"use client";

import { Button } from "@/components/ui/button";

import {
  CrudToolbar,
} from "@/components/crud";

interface ProductToolbarProps {
  search: string;

  onSearchChange: (
    value: string
  ) => void;

  onCreate: () => void;
}

export function ProductToolbar({
  search,
  onSearchChange,
  onCreate,
}: ProductToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
      createButton={
        <Button onClick={onCreate}>
          New Product
        </Button>
      }
    />
  );
}
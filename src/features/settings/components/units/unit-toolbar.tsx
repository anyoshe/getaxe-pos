"use client";

import { Button } from "@/components/ui/button";

import {
  CrudToolbar,
} from "@/components/crud";


interface UnitToolbarProps {
  search: string;

  onSearchChange: (
    value: string
  ) => void;

  onCreate: () => void;
}


export function UnitToolbar({
  search,
  onSearchChange,
  onCreate,
}: UnitToolbarProps) {

  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}

      createButton={
        <Button
          onClick={onCreate}
        >
          New Unit
        </Button>
      }
    />
  );
}
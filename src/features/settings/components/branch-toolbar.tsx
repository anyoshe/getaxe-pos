"use client";

import { Button } from "@/components/ui/button";

import {
  CrudToolbar,
} from "@/components/crud";

interface BranchToolbarProps {
  search: string;

  onSearchChange: (
    value: string
  ) => void;

  onCreate: () => void;
}

export function BranchToolbar({
  search,
  onSearchChange,
  onCreate,
}: BranchToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
      createButton={
        <Button onClick={onCreate}>
          New Branch
        </Button>
      }
    />
  );
}
"use client";

import { useState } from "react";

import {
  WarehouseTable,
  WarehouseToolbar,
  WarehouseDialog,
} from "./warehouses";

import {
  deleteWarehouseAction,
} from "../actions/delete-warehouse";

import {
  CrudPage,
  DeleteDialog,
} from "@/components/crud";

import type {
  Warehouse,
} from "../types/warehouse";

import type {
  Branch,
} from "../types/branch";

interface WarehousesClientProps {
  warehouses: Warehouse[];
  branches: Branch[];
}
export function WarehousesClient({
  warehouses,
  branches,
}: WarehousesClientProps) {
  const [open, setOpen] =
    useState(false);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filteredWarehouses =
    warehouses.filter((warehouse) =>
      warehouse.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <CrudPage
      title="Warehouses"
      description="Manage business warehouses."
    >
      <div className="space-y-6">

        <WarehouseToolbar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setSelectedWarehouse(null);
            setOpen(true);
          }}
        />

        <WarehouseTable
          data={filteredWarehouses}
          onEdit={(warehouse) => {
            setSelectedWarehouse(
              warehouse
            );
            setOpen(true);
          }}
          onDelete={(warehouse) => {
            setSelectedWarehouse(
              warehouse
            );
            setDeleteOpen(true);
          }}
        />

        <WarehouseDialog
  open={open}
  onOpenChange={setOpen}
  warehouse={selectedWarehouse}
  branches={branches}
/>

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Delete Warehouse?"
          description={
            selectedWarehouse
              ? `Are you sure you want to delete "${selectedWarehouse.name}"?`
              : "This action cannot be undone."
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedWarehouse(null);
          }}
          onConfirm={async () => {
            if (!selectedWarehouse) return;

            try {
              setDeleting(true);

              await deleteWarehouseAction(
                selectedWarehouse.id
              );
              setDeleteOpen(false);
              setSelectedWarehouse(null);
            } finally {
              setDeleting(false);
            }
          }}
        />

      </div>
    </CrudPage>
  );
}
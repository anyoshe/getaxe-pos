"use client";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type {
  Warehouse,
} from "../../types/warehouse";

interface WarehouseTableProps {
  data: Warehouse[];

  onEdit: (
    warehouse: Warehouse
  ) => void;

  onDelete: (
    warehouse: Warehouse
  ) => void;
}

export function WarehouseTable({
  data,
  onEdit,
  onDelete,
}: WarehouseTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "code",
          title: "Code",
        },

        {
          key: "name",
          title: "Warehouse",
        },

        {
          key: "branch",
          title: "Branch",
          render: (warehouse) =>
            warehouse.branch?.name ??
            "-",
        },

        {
          key: "description",
          title: "Description",
        },

        {
          key: "active",
          title: "Status",
          render: (warehouse) => (
            <StatusBadge
              active={warehouse.active}
            />
          ),
        },
      ]}

      actions={[
        {
          label: "Edit",
          onClick: onEdit,
        },

        {
          label: "Delete",
          variant: "destructive",
          onClick: onDelete,
        },
      ]}
    />
  );
}
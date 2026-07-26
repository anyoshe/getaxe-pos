"use client";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type {
  Unit,
} from "../../types";


interface UnitTableProps {
  data: Unit[];

  onEdit: (
    unit: Unit
  ) => void;

  onDelete: (
    unit: Unit
  ) => void;
}


export function UnitTable({
  data,
  onEdit,
  onDelete,
}: UnitTableProps) {

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
          title: "Unit",
        },

        {
          key: "symbol",
          title: "Symbol",
        },

        {
          key: "description",
          title: "Description",
        },

        {
          key: "active",
          title: "Status",

          render: (unit) => (
            <StatusBadge
              active={unit.active}
            />
          ),
        },
      ]}

      actions={[
        {
          label: "Edit",

          onClick: onEdit,

          disabled: (unit) =>
            !unit.businessId,
        },

        {
          label: "Delete",

          variant: "destructive",

          onClick: onDelete,

          disabled: (unit) =>
            !unit.businessId,
        },
      ]}
    />
  );
}
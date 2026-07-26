"use client";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type { Branch } from "../types";


interface BranchTableProps {
  data: Branch[];

  onEdit: (branch: Branch) => void;

  onDelete: (branch: Branch) => void;
}


export function BranchTable({
  data,
  onEdit,
  onDelete,
}: BranchTableProps) {

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
          title: "Branch Name",
        },

        {
          key: "phone",
          title: "Phone",
        },

        {
          key: "county",
          title: "County",
        },

        {
          key: "town",
          title: "Town",
        },

        {
          key: "isHeadOffice",
          title: "Head Office",
          render: (branch) => (
            <StatusBadge
              active={branch.isHeadOffice}
              activeLabel="Head Office"
              inactiveLabel="Branch"
            />
          ),
        },

        {
          key: "active",
          title: "Status",
          render: (branch) => (
            <StatusBadge
              active={branch.active}
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
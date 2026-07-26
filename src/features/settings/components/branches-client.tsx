"use client";

import { useState } from "react";

import {
  BranchTable,
  BranchToolbar,
  BranchDialog,
} from "./";
import { deleteBranch } from "../actions/branches";

import {
  CrudPage,
  DeleteDialog,
} from "@/components/crud";

import type { Branch } from "../types";


interface BranchesClientProps {
  branches: Branch[];
}


export function BranchesClient({
  branches,
}: BranchesClientProps) {

  const [open, setOpen] =
    useState(false);

  const [selectedBranch, setSelectedBranch] =
    useState<Branch | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");


  const filteredBranches =
    branches.filter((branch) =>
      branch.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (
    <CrudPage
      title="Branches"
      description="Manage business branches."
    >

      <div className="space-y-6">

        <BranchToolbar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setSelectedBranch(null);
            setOpen(true);
          }}
        />


        <BranchTable
          data={filteredBranches}
          onEdit={(branch) => {
            setSelectedBranch(branch);
            setOpen(true);
          }}
          onDelete={(branch) => {
            setSelectedBranch(branch);
            setDeleteOpen(true);
          }}
        />


        <BranchDialog
          open={open}
          onOpenChange={setOpen}
          branch={selectedBranch}
        />

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Delete Branch?"
          description={
            selectedBranch
              ? `Are you sure you want to delete "${selectedBranch.name}"?`
              : "This action cannot be undone."
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedBranch(null);
          }}
          onConfirm={async () => {
            if (!selectedBranch) return;

            try {
              setDeleting(true);

              await deleteBranch(
                selectedBranch.id,
                selectedBranch.businessId
              );

              setDeleteOpen(false);
              setSelectedBranch(null);
            } finally {
              setDeleting(false);
            }
          }}
        />

      </div>

    </CrudPage>
  );
}
"use client";

import {
  useState,
} from "react";

import {
  UnitTable,
  UnitToolbar,
  UnitDialog,
} from "./units";

import {
  deleteUnitAction,
} from "../actions/delete-unit";

import {
  CrudPage,
  DeleteDialog,
} from "@/components/crud";

import type {
  Unit,
} from "../types";


interface UnitsClientProps {
  units: Unit[];
}


export function UnitsClient({
  units,
}: UnitsClientProps) {

  const [open, setOpen] =
    useState(false);


  const [selectedUnit, setSelectedUnit] =
    useState<Unit | null>(null);


  const [deleteOpen, setDeleteOpen] =
    useState(false);


  const [deleting, setDeleting] =
    useState(false);


  const [search, setSearch] =
    useState("");


  const filteredUnits =
    units.filter((unit) =>
      `${unit.code} ${unit.name} ${unit.symbol ?? ""}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (
    <CrudPage
      title="Units"
      description="Manage measurement units."
    >

      <div className="space-y-6">

        <UnitToolbar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setSelectedUnit(null);
            setOpen(true);
          }}
        />


        <UnitTable
          data={filteredUnits}

          onEdit={(unit) => {
            setSelectedUnit(unit);
            setOpen(true);
          }}

          onDelete={(unit) => {

            // extra protection
            if (!unit.businessId) {
              return;
            }

            setSelectedUnit(unit);
            setDeleteOpen(true);
          }}
        />


        <UnitDialog
          open={open}
          onOpenChange={setOpen}
          unit={selectedUnit}
        />


        <DeleteDialog
          open={deleteOpen}
          loading={deleting}

          title="Delete Unit?"

          description={
            selectedUnit
              ? `Are you sure you want to delete "${selectedUnit.name}"?`
              : "This action cannot be undone."
          }


          onCancel={() => {
            setDeleteOpen(false);
            setSelectedUnit(null);
          }}


          onConfirm={async () => {

            if (!selectedUnit) {
              return;
            }


            try {

              setDeleting(true);


              await deleteUnitAction(
                selectedUnit.id
              );


              setDeleteOpen(false);
              setSelectedUnit(null);


            } finally {

              setDeleting(false);

            }

          }}

        />

      </div>

    </CrudPage>
  );
}
"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  getRolesAction,
  activateRoleAction,
  deactivateRoleAction,
  deleteRoleAction,
} from "../actions";

import {
  RoleToolbar,
  RoleTable,
  RoleDialog,
  RoleViewDialog,
} from "./roles";

interface Role {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  isSystem: boolean;
}

export function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([]);

  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [loadingAction, setLoadingAction] = useState(false);

  const [open, setOpen] = useState(false);

  const [viewRole, setViewRole] =
    useState<Role>();

  const [selectedRole, setSelectedRole] =
    useState<Role | undefined>();

  const [roleToDelete, setRoleToDelete] =
    useState<Role | undefined>();

  const [page, setPage] = useState(1);

  const pageSize = 10;

  async function loadRoles() {
    const result = await getRolesAction();

    if (result.success) {
      setRoles(result.data ?? []);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    let data = [...roles];

    if (search.trim()) {
      const query = search.toLowerCase();

      data = data.filter(
        (role) =>
          role.name.toLowerCase().includes(query) ||
          (role.description ?? "")
            .toLowerCase()
            .includes(query),
      );
    }

    if (status !== "") {
      data = data.filter(
        (role) =>
          role.active === (status === "true"),
      );
    }

    setFilteredRoles(data);

    setPage(1);
  }, [roles, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / pageSize),
  );

  const paginatedRoles = filteredRoles.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function handleCreate() {
    setSelectedRole(undefined);

    setOpen(true);
  }

  function handleView(
    role: Role,
  ) {

    setViewRole(role);

  }

  function handleEdit(role: Role) {
    setSelectedRole(role);

    setOpen(true);
  }

  async function handleActivate(role: Role) {
    setLoadingAction(true);

    try {
      await activateRoleAction(role.id);

      toast.success("Role activated successfully.");

      await loadRoles();
    } catch {
      toast.error("Failed to activate role.");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDeactivate(role: Role) {
    setLoadingAction(true);

    try {
      await deactivateRoleAction(role.id);

      toast.success("Role deactivated successfully.");

      await loadRoles();
    } catch {
      toast.error("Failed to deactivate role.");
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">

        <RoleToolbar
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onCreate={handleCreate}
        />

        <RoleTable
          roles={paginatedRoles}
          loading={loadingAction}
          onView={handleView}
          onEdit={handleEdit}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={setRoleToDelete}
        />

        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>{paginatedRoles.length}</strong> of{" "}
            <strong>{filteredRoles.length}</strong> roles
          </p>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() =>
                setPage((previous) => previous - 1)
              }
            >
              Previous
            </Button>

            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((previous) => previous + 1)
              }
            >
              Next
            </Button>

          </div>

        </div>

      </div>


      <RoleDialog
        open={open}
        onOpenChange={setOpen}
        role={selectedRole}
        onSuccess={loadRoles}
      />
      
      <RoleViewDialog
        open={!!viewRole}
        role={viewRole}
        onOpenChange={(open) => {
          if (!open) {
            setViewRole(undefined);
          }
        }}
      />

      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setRoleToDelete(undefined);
          }
        }}
      >


        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">

          <AlertDialogHeader>

            <AlertDialogTitle className="text-red-600">
              Delete Role
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{roleToDelete?.name}</strong>?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={loadingAction}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!roleToDelete) {
                  return;
                }

                setLoadingAction(true);

                try {
                  await deleteRoleAction(
                    roleToDelete.id,
                  );

                  toast.success(
                    "Role deleted successfully.",
                  );

                  setRoleToDelete(undefined);

                  await loadRoles();
                } catch {
                  toast.error(
                    "Failed to delete role.",
                  );
                } finally {
                  setLoadingAction(false);
                }
              }}
            >
              Delete Role
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}
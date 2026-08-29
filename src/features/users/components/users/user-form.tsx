"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUserAction,
  updateUserAction,
  getRolesAction,
  getUserPermissionOverridesAction,
  updateUserPermissionOverridesAction,
} from "../../actions";
import { getPermissionsAction } from "../../actions/permissions";
import type { User } from "../../types";
import {
  RolePermissionsPicker,
  type PermissionOption,
} from "../roles/role-permissions-picker";

interface Role {
  id: string;
  name: string;
}

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [allPermissions, setAllPermissions] = useState<PermissionOption[]>([]);
  const [extraGrants, setExtraGrants] = useState<string[]>([]);
  const [denies, setDenies] = useState<string[]>([]);
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) setRoleId(user.roleId ?? "");
  }, [user]);

  useEffect(() => {
    async function loadRoles() {
      const result = await getRolesAction();
      if (result.success) setRoles(result.data ?? []);
    }
    void loadRoles();
  }, []);

  useEffect(() => {
    async function loadCatalogue() {
      const result = await getPermissionsAction();
      if (result.success && result.data) {
        setAllPermissions(
          result.data.map((p: PermissionOption) => ({
            id: p.id,
            code: p.code,
            module: p.module,
            name: p.name,
            description: p.description,
          })),
        );
      }
    }
    void loadCatalogue();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    async function loadOverrides() {
      const result = await getUserPermissionOverridesAction(user!.id);
      if (result.success && result.data) {
        setExtraGrants(result.data.grants);
        setDenies(result.data.denies);
        setRolePermissionIds(result.data.rolePermissionIds);
      }
    }
    void loadOverrides();
  }, [user?.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);

    const data = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone") || ""),
      roleId,
    };

    let result;
    if (user) {
      result = await updateUserAction(user.id, data);
      if (result.success) {
        const perm = await updateUserPermissionOverridesAction(
          user.id,
          extraGrants,
          denies,
        );
        if (!perm.success) {
          toast.error(perm.message);
          setLoading(false);
          return;
        }
      }
    } else {
      result = await createUserAction({
        ...data,
        password: String(form.get("password")),
      });
      if (result.success && result.data?.id) {
        if (extraGrants.length || denies.length) {
          await updateUserPermissionOverridesAction(
            result.data.id,
            extraGrants,
            denies,
          );
        }
      }
    }

    setLoading(false);

    if (result.success) {
      toast.success(user ? "User updated successfully." : "User created successfully.");
      onSuccess?.();
    } else {
      toast.error(
        result.message ??
          (user ? "Failed to update user." : "Failed to create user."),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user?.name ?? ""}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email ?? ""}
            placeholder="name@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user?.phone ?? ""}
            placeholder="Optional phone"
          />
        </div>

        {!user ? (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="roleId">Role</Label>
          <select
            id="roleId"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
          >
            <option value="" disabled>
              {roles.length === 0 ? "Loading roles…" : "Select role"}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {roleId && roles.length > 0 ? (
            <p className="text-xs font-medium text-primary">
              Selected: {roles.find((r) => r.id === roleId)?.name ?? roleId}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Base access comes from the role. Below you can give this person extra
            rights or block some role rights without changing other users on the
            same role (e.g. Risper vs Axel as cashiers).
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h4 className="font-semibold text-primary">
          Extra permissions (this user only)
        </h4>
        <p className="text-xs text-muted-foreground">
          Add rights beyond the role — e.g. let Risper view stock while Axel stays
          a standard cashier.
        </p>
        <RolePermissionsPicker
          permissions={allPermissions}
          selectedIds={extraGrants}
          onChange={setExtraGrants}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <h4 className="font-semibold text-destructive">
          Blocked permissions (this user only)
        </h4>
        <p className="text-xs text-muted-foreground">
          Deny rights the role normally has — e.g. block returns for one cashier
          without creating a new role.
        </p>
        <RolePermissionsPicker
          permissions={allPermissions}
          selectedIds={denies}
          onChange={setDenies}
        />
        {rolePermissionIds.length > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            This role currently has {rolePermissionIds.length} permissions. Blocks
            only affect this user.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading || !roleId}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? user
            ? "Updating..."
            : "Creating..."
          : user
            ? "Update User"
            : "Create User"}
      </button>
    </form>
  );
}

"use client";

import {
    useState, useEffect
} from "react";

import {
    createRoleAction,
    updateRoleAction,
    getPermissionsAction,
    getRolePermissionsAction,
    updateRolePermissionsAction,
} from "../../actions";

import {
    toast,
} from "sonner";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";

import {
    Checkbox,
} from "@/components/ui/checkbox";
import {
    RolePermissionsPicker,
} from "./role-permissions-picker";
import {
    Textarea,
} from "@/components/ui/textarea";

interface Role {

    id: string;

    name: string;

    description: string | null;

    active: boolean;

    isSystem: boolean;

}
interface Role {

  id: string;

  name: string;

  description: string | null;

  active: boolean;

  isSystem: boolean;

  permissions?: {
      id: string;
  }[];

}

interface Permission {

    id: string;

    code: string;

    module: string;

    name: string;

    description: string | null;

}

interface RoleFormProps {

    role?: Role;

    onSuccess?: () => void;

}

export function RoleForm({
    role,
    onSuccess,
}: RoleFormProps) {

    const [loading, setLoading] =
        useState(false);

    const [active, setActive] =
        useState(
            role?.active ?? true,
        );

    const [permissions, setPermissions] =
        useState<Permission[]>([]);

    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>([]);

    useEffect(() => {

        async function loadPermissions() {

            const result =
                await getPermissionsAction();

            if (result.success) {

                setPermissions(
                    result.data ?? [],
                );

            }

        }

        loadPermissions();

    }, []);

    useEffect(() => {

        if (!role) {

            return;

        }

        const roleId = role.id;

        async function loadRolePermissions() {

            const result =
                await getRolePermissionsAction(
                    roleId,
                );

            if (result.success) {

                setSelectedPermissions(

                    (result.data ?? []).map(
                        permission => permission.id,
                    ),

                );

            }

        }

        loadRolePermissions();

    }, [role]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        setLoading(true);

        const form =
            new FormData(
                event.currentTarget,
            );

        const payload = {

            name:
                String(
                    form.get("name"),
                ),

            description:
                String(
                    form.get("description") || "",
                ),

            active,

        };

        let result;

        if (role) {

            result =
                await updateRoleAction(
                    role.id,
                    payload,
                );

            if (result.success) {

                await updateRolePermissionsAction(
                    role.id,
                    selectedPermissions,
                );

            }

        } else {

            result =
                await createRoleAction(
                    payload,
                );

            if (
                result.success &&
                result.data
            ) {

                await updateRolePermissionsAction(
                    result.data.id,
                    selectedPermissions,
                );

            }

        }

        setLoading(false);

        if (result.success) {

            toast.success(
                role
                    ? "Role updated successfully."
                    : "Role created successfully.",
            );

            onSuccess?.();

            return;

        }

        toast.error(
            result.message ??
            "Operation failed.",
        );

    }

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            <div
                className="
          rounded-xl
          border
          bg-gradient-to-r
          from-indigo-50
          via-white
          to-lime-50
          p-4
          dark:from-indigo-950/20
          dark:via-background
          dark:to-lime-950/10
        "
            >

                <h3
                    className="
            text-lg
            font-semibold
            text-indigo-700
            dark:text-indigo-300
          "
                >
                    Role Details
                </h3>

                <p className="text-sm text-muted-foreground">

                    Configure the role information below.

                </p>

            </div>

            <div className="space-y-2">

                <Label htmlFor="name">

                    Role Name

                </Label>

                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={role?.name ?? ""}
                    placeholder="Sales Manager"
                    className="
            focus-visible:ring-indigo-500
          "
                />

            </div>

            <div className="space-y-2">

                <Label htmlFor="description">

                    Description

                </Label>

                <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={
                        role?.description ?? ""
                    }
                    placeholder="Describe the responsibilities of this role..."
                    className="
            resize-none
            focus-visible:ring-indigo-500
          "
                />

            </div>

            <div
                className="
                rounded-lg
                border
                p-4
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        p-4
                    "
                >

                    <div>

                        <Label htmlFor="active">
                            Active Role
                        </Label>

                        <p className="text-sm text-muted-foreground">
                            Users can be assigned to this role.
                        </p>

                    </div>

                    <Checkbox
                        id="active"
                        checked={active}
                        onCheckedChange={(checked) =>
                            setActive(Boolean(checked))
                        }
                    />

                </div>

            </div>

            {role?.isSystem && (

                <div
                    className="
            rounded-lg
            border
            border-indigo-200
            bg-indigo-50
            p-4
            dark:border-indigo-900
            dark:bg-indigo-950/20
          "
                >

                    <p
                        className="
              font-medium
              text-indigo-700
              dark:text-indigo-300
            "
                    >

                        System Role

                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Built-in role — you can freely add or remove permissions
                        for cashiers and other staff without creating a new role.
                        Prefer not to delete this role.

                    </p>

                </div>

            )}

            <div
                className="
        rounded-xl
        border
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-lime-50
        p-5
        dark:from-indigo-950/20
        dark:via-background
        dark:to-lime-950/10
    "
            >

                <div className="mb-4">

                    <h4
                        className="
                font-semibold
                text-indigo-700
                dark:text-indigo-300
            "
                    >
                        Permissions
                    </h4>

                    <p className="text-sm text-muted-foreground">
                        Tick extra permissions for this role (e.g. give a cashier
                        stock view) or untick to reduce access — no new role required.
                        System roles can be customized the same way.
                    </p>

                </div>

                <RolePermissionsPicker
                    permissions={permissions}
                    selectedIds={selectedPermissions}
                    onChange={setSelectedPermissions}
                />

            </div>

            <div
                className="
          flex
          justify-end
        "
            >

                <Button
                    type="submit"
                    disabled={loading}
                    className="
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            min-w-36
          "
                >

                    {loading
                        ? role
                            ? "Updating..."
                            : "Creating..."
                        : role
                            ? "Update Role"
                            : "Create Role"}

                </Button>

            </div>

        </form>

    );

}
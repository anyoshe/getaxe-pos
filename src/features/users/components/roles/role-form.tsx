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

                        This is a built-in role. Permissions can be managed,
                        but the role itself should not be deleted.

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
                        Select the permissions assigned to this role.
                    </p>

                </div>


                <div className="space-y-4">


                    {
                        Object.entries(
                            permissions.reduce(
                                (
                                    groups,
                                    permission,
                                ) => {

                                    if (
                                        !groups[permission.module]
                                    ) {

                                        groups[permission.module] = [];

                                    }

                                    groups[permission.module].push(
                                        permission,
                                    );

                                    return groups;

                                },
                                {} as Record<
                                    string,
                                    Permission[]
                                >,
                            ),
                        )
                            .map(
                                (
                                    [
                                        module,
                                        modulePermissions,
                                    ],
                                ) => (

                                    <div
                                        key={module}
                                        className="
                        rounded-lg
                        border
                        bg-white/60
                        p-4
                        dark:bg-background/40
                    "
                                    >

                                        <h5
                                            className="
                            mb-3
                            font-medium
                            capitalize
                            text-indigo-600
                            dark:text-indigo-300
                        "
                                        >
                                            {module}
                                        </h5>


                                        <div
                                            className="
                            grid
                            gap-3
                            md:grid-cols-2
                        "
                                        >

                                            {
                                                modulePermissions.map(
                                                    (
                                                        permission,
                                                    ) => (

                                                        <label
                                                            key={permission.id}
                                                            className="
                                    flex
                                    cursor-pointer
                                    items-start
                                    gap-3
                                    rounded-lg
                                    border
                                    p-3
                                    transition
                                    hover:border-indigo-400
                                    hover:bg-indigo-50
                                    dark:hover:bg-indigo-950/30
                                "
                                                        >

                                                            <Checkbox

                                                                checked={
                                                                    selectedPermissions.includes(
                                                                        permission.id,
                                                                    )
                                                                }

                                                                onCheckedChange={
                                                                    (checked) => {

                                                                        if (checked) {

                                                                            setSelectedPermissions(
                                                                                previous => [
                                                                                    ...previous,
                                                                                    permission.id,
                                                                                ],
                                                                            );

                                                                        } else {

                                                                            setSelectedPermissions(
                                                                                previous =>
                                                                                    previous.filter(
                                                                                        id =>
                                                                                            id !== permission.id,
                                                                                    ),
                                                                            );

                                                                        }

                                                                    }
                                                                }

                                                            />


                                                            <div>

                                                                <p
                                                                    className="
                                            text-sm
                                            font-medium
                                        "
                                                                >
                                                                    {permission.name}
                                                                </p>

                                                                <p
                                                                    className="
                                            text-xs
                                            text-muted-foreground
                                        "
                                                                >
                                                                    {permission.code}
                                                                </p>

                                                            </div>


                                                        </label>

                                                    ))
                                            }


                                        </div>


                                    </div>

                                ))
                    }


                </div>


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
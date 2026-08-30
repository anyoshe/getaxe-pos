"use client";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Separator,
} from "@/components/ui/separator";

import {
    useEffect,
    useState,
} from "react";

import {
    getRoleUsersAction,
} from "../../actions";

interface Permission {

    id: string;

    code: string;

    name: string;

    module: string;

    description: string | null;

}

interface RoleUser {

    id: string;

    name: string;

    email: string;

    phone: string | null;

    active: boolean;

}

interface Role {

    id: string;

    name: string;

    description: string | null;

    active: boolean;

    isSystem: boolean;

    permissions?: Permission[];

}

interface RoleViewProps {

    role: Role;

}

export function RoleView({
    role,
}: RoleViewProps) {

    const [assignedUsers, setAssignedUsers] =
    useState<RoleUser[]>([]);

    useEffect(() => {

    async function loadUsers() {

        const result =
            await getRoleUsersAction(
                role.id,
            );

        if (result.success) {

            setAssignedUsers(
                result.data ?? [],
            );

        }

    }

    loadUsers();

}, [role.id]);

    const groupedPermissions =
        (role.permissions ?? []).reduce(
            (groups, permission) => {

                if (!groups[permission.module]) {

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
        );

    return (

        <div className="space-y-6">

            <div
                className="
                    rounded-xl
                    border
                    bg-gradient-to-r
                    from-indigo-50 dark:from-indigo-950/40
                    via-background dark:via-card
                    to-lime-50 dark:to-background
                    p-5
                    dark:from-indigo-950/20
                    dark:via-background
                    dark:to-lime-950/10
                "
            >

                <h2
                    className="
                        text-2xl
                        font-bold
                        text-indigo-700
                        dark:text-indigo-300
                    "
                >
                    {role.name}
                </h2>

                <p className="mt-2 text-muted-foreground">

                    {role.description ||
                        "No description provided."}

                </p>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-lg border p-4">

                    <p className="text-sm text-muted-foreground">

                        Status

                    </p>

                    <Badge
                        className={
                            role.active
                                ? "mt-2 bg-lime-100 text-lime-700 hover:bg-lime-100"
                                : "mt-2"
                        }
                        variant={
                            role.active
                                ? undefined
                                : "destructive"
                        }
                    >

                        {role.active
                            ? "Active"
                            : "Inactive"}

                    </Badge>

                </div>

                <div className="rounded-lg border p-4">

                    <p className="text-sm text-muted-foreground">

                        Type

                    </p>

                    <Badge
                        className="mt-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                    >

                        {role.isSystem
                            ? "System Role"
                            : "Business Role"}

                    </Badge>

                </div>

                <div className="rounded-lg border p-4">

                    <p className="text-sm text-muted-foreground">

                        Permissions

                    </p>

                    <p className="mt-2 text-2xl font-bold">

                        {role.permissions?.length ?? 0}

                    </p>

                </div>

            </div>

            <Separator />

            <div>

                <h3
                    className="
                        text-lg
                        font-semibold
                        text-indigo-700
                        dark:text-indigo-300
                    "
                >

                    Assigned Permissions

                </h3>

                <p className="text-sm text-muted-foreground">

                    Permissions available to users assigned to this role.

                </p>

            </div>

            {Object.keys(
                groupedPermissions,
            ).length === 0 && (

                    <div
                        className="
                        rounded-lg
                        border
                        border-dashed
                        p-8
                        text-center
                    "
                    >

                        <p className="text-muted-foreground">

                            No permissions assigned.

                        </p>

                    </div>

                )}

            {Object.entries(
                groupedPermissions,
            ).map(([module, permissions]) => (

                <div
                    key={module}
                    className="
                        rounded-xl
                        border
                        p-5
                    "
                >

                    <h4
                        className="
                            mb-4
                            text-lg
                            font-semibold
                            capitalize
                            text-indigo-700
                            dark:text-indigo-300
                        "
                    >

                        {module}

                    </h4>

                    <div
                        className="
                            grid
                            gap-3
                            md:grid-cols-2
                            xl:grid-cols-3
                        "
                    >

                        {permissions.map(
                            (permission) => (

                                <div
                                    key={permission.id}
                                    className="
                                        rounded-lg
                                        border
                                        bg-muted/30
                                        p-4
                                    "
                                >

                                    <p className="font-medium">

                                        {permission.name}

                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-muted-foreground
                                        "
                                    >

                                        {permission.code}

                                    </p>

                                    {permission.description && (

                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                text-muted-foreground
                                            "
                                        >

                                            {permission.description}

                                        </p>

                                    )}

                                </div>

                            ),
                        )}

                    </div>

                </div>

            ))}

            <Separator />

<div>

    <h3
        className="
            text-lg
            font-semibold
            text-indigo-700
            dark:text-indigo-300
        "
    >
        Assigned Users
    </h3>

    <p className="text-sm text-muted-foreground">
        Users currently assigned to this role.
    </p>

</div>


{assignedUsers.length === 0 ? (

    <div
        className="
            rounded-lg
            border
            border-dashed
            p-8
            text-center
        "
    >

        <p className="text-muted-foreground">
            No users assigned.
        </p>

    </div>

) : (

    <div
        className="
            grid
            gap-3
            md:grid-cols-2
        "
    >

        {assignedUsers.map((user) => (

            <div
                key={user.id}
                className="
                    rounded-lg
                    border
                    p-4
                "
            >

                <p className="font-medium">
                    {user.name}
                </p>

                <p className="text-sm text-muted-foreground">
                    {user.email}
                </p>

                <Badge
                    className="mt-2"
                    variant={
                        user.active
                            ? undefined
                            : "destructive"
                    }
                >
                    {user.active
                        ? "Active"
                        : "Inactive"}
                </Badge>

            </div>

        ))}

    </div>

)}

        </div>

    );

}
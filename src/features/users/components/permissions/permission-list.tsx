"use client";

import { useMemo } from "react";

import {
    PermissionGroup,
} from "./permission-group";

interface Permission {

    id: string;

    code: string;

    name: string;

    module: string;

    description: string | null;

}

interface PermissionListProps {

    permissions: Permission[];

    selectedPermissions: string[];

    onToggle: (
        permissionId: string,
        checked: boolean,
    ) => void;

}

export function PermissionList({

    permissions,

    selectedPermissions,

    onToggle,

}: PermissionListProps) {

    const groupedPermissions = useMemo(() => {

        const groups: Record<
            string,
            Permission[]
        > = {};

        for (const permission of permissions) {

            if (!groups[permission.module]) {

                groups[permission.module] = [];

            }

            groups[permission.module].push(permission);

        }

        return Object.entries(groups).sort(
            ([a], [b]) =>
                a.localeCompare(b),
        );

    }, [permissions]);

    if (permissions.length === 0) {

        return (

            <div
                className="
                    rounded-xl
                    border
                    border-dashed
                    p-8
                    text-center
                    text-muted-foreground
                "
            >

                No permissions found.

            </div>

        );

    }

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-6
                xl:grid-cols-2
            "
        >

            {groupedPermissions.map(

                ([module, permissions]) => (

                    <PermissionGroup

                        key={module}

                        title={module}

                        permissions={permissions}

                        selectedPermissions={
                            selectedPermissions
                        }

                        onToggle={onToggle}

                    />

                ),

            )}

        </div>

    );

}
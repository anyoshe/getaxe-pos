"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface Permission {

    id: string;

    code: string;

    name: string;

    module: string;

    description: string | null;

}

interface PermissionGroupProps {

    title: string;

    permissions: Permission[];

    selectedPermissions: string[];

    onToggle: (
        permissionId: string,
        checked: boolean,
    ) => void;

}

export function PermissionGroup({

    title,

    permissions,

    selectedPermissions,

    onToggle,

}: PermissionGroupProps) {

    return (

        <div
            className="
                rounded-xl
                border
                bg-card
                shadow-sm
                overflow-hidden
            "
        >

            <div
                className="
                    bg-gradient-to-r
                    from-indigo-600
                    to-indigo-500
                    px-4
                    py-3
                "
            >

                <h3
                    className="
                        font-semibold
                        text-white
                    "
                >
                    {title}
                </h3>

            </div>

            <div className="space-y-2 p-4">

                {permissions.map((permission) => {

                    const checked =
                        selectedPermissions.includes(
                            permission.id,
                        );

                    return (

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
                                transition-all
                                hover:border-indigo-300
                                hover:bg-primary/10
                                dark:hover:bg-indigo-950/20
                            "
                        >

                            <Checkbox

                                checked={checked}

                                onCheckedChange={(value) =>
                                    onToggle(
                                        permission.id,
                                        Boolean(value),
                                    )
                                }

                                className="
                                    mt-1
                                    data-[state=checked]:border-lime-600
                                    data-[state=checked]:bg-lime-600
                                "

                            />

                            <div className="flex-1">

                                <p className="font-medium">

                                    {permission.name}

                                </p>

                                {permission.description && (

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >

                                        {permission.description}

                                    </p>

                                )}

                            </div>

                        </label>

                    );

                })}

            </div>

        </div>

    );

}
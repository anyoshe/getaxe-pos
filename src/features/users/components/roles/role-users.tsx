"use client";

import {
    UserRound,
} from "lucide-react";

import {
    Badge,
} from "@/components/ui/badge";

interface RoleUser {

    id: string;

    name: string;

    email: string;

    phone: string | null;

    active: boolean;

}


interface RoleUsersProps {

    users: RoleUser[];

}


export function RoleUsers({
    users,
}: RoleUsersProps) {

    return (

        <div
            className="
                rounded-xl
                border
                bg-gradient-to-br
                from-indigo-50 dark:from-indigo-950/40
                via-background dark:via-card
                to-lime-50 dark:to-background
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
                    Assigned Users ({users.length})
                </h4>

                <p className="text-sm text-muted-foreground">
                    Users currently assigned to this role.
                </p>

            </div>


            {users.length === 0 ? (

                <div
                    className="
                        rounded-lg
                        border
                        border-dashed
                        p-6
                        text-center
                        text-sm
                        text-muted-foreground
                    "
                >

                    No users assigned to this role.

                </div>

            ) : (

                <div
                    className="
                        space-y-3
                    "
                >

                    {users.map((user) => (

                        <div
                            key={user.id}
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-lg
                                border
                                bg-card/70
                                p-4
                                dark:bg-background/50
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-indigo-100
                                        text-indigo-700
                                        dark:bg-indigo-900/40
                                        dark:text-indigo-300
                                    "
                                >

                                    <UserRound
                                        size={18}
                                    />

                                </div>


                                <div>

                                    <p
                                        className="
                                            font-medium
                                        "
                                    >
                                        {user.name}
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        {user.email}
                                    </p>

                                    {user.phone && (

                                        <p
                                            className="
                                                text-xs
                                                text-muted-foreground
                                            "
                                        >
                                            {user.phone}
                                        </p>

                                    )}

                                </div>

                            </div>


                            {user.active ? (

                                <Badge
                                    className="
                                        bg-lime-100
                                        text-lime-700
                                        dark:bg-lime-900/40
                                        dark:text-lime-300
                                    "
                                >
                                    Active
                                </Badge>

                            ) : (

                                <Badge
                                    variant="destructive"
                                >
                                    Inactive
                                </Badge>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}
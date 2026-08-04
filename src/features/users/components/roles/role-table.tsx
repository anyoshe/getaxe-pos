"use client";

import {
    Eye,
    MoreHorizontal,
    Pencil,
    Shield,
    ShieldOff,
    Trash2,
    KeyRound,
} from "lucide-react";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Button,
} from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Role {

    id: string;

    name: string;

    description: string | null;

    active: boolean;

    isSystem: boolean;

    permissions?: {
        id: string;
        code: string;
        name: string;
    }[];

}

interface RoleTableProps {

    roles: Role[];

    loading?: boolean;

    onView?: (
        role: Role,
    ) => void;

    onEdit?: (
        role: Role,
    ) => void;

    onActivate?: (
        role: Role,
    ) => void;

    onDeactivate?: (
        role: Role,
    ) => void;

    onDelete?: (
        role: Role,
    ) => void;

}

export function RoleTable({

    roles,

    loading = false,

    onView,

    onEdit,

    onActivate,

    onDeactivate,

    onDelete,

}: RoleTableProps) {

    return (

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

            <div className="overflow-x-auto">

                <Table className="min-w-[1000px]">

                    <TableHeader>

                        <TableRow className="bg-indigo-50/60 dark:bg-indigo-950/20">

                            <TableHead>Name</TableHead>

                            <TableHead>Description</TableHead>

                            <TableHead>Type</TableHead>
                            <TableHead>
                                Permissions
                            </TableHead>

                            <TableHead>Status</TableHead>

                            <TableHead className="text-right">
                                Actions
                            </TableHead>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {roles.length === 0 && (

                            <TableRow>

                                <TableCell
                                    colSpan={5}
                                    className="py-16 text-center"
                                >

                                    <div className="space-y-2">

                                        <div className="text-lg font-semibold text-indigo-600">

                                            No roles found

                                        </div>

                                        <p className="text-sm text-muted-foreground">

                                            Create your first role to begin assigning permissions.

                                        </p>

                                    </div>

                                </TableCell>

                            </TableRow>

                        )}

                        {roles.map((role) => (

                            <TableRow
                                key={role.id}
                                className="transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10"
                            >

                                <TableCell className="font-semibold">

                                    {role.name}

                                </TableCell>

                                <TableCell
                                    className="
                                        max-w-sm
                                        truncate
                                        text-muted-foreground
                                    "
                                    title={
                                        role.description ?? ""
                                    }
                                >

                                    {role.description || "-"}

                                </TableCell>

                                <TableCell>

                                    <Badge
                                        className="
                                        bg-indigo-100
                                        text-indigo-700
                                        hover:bg-indigo-100
                                        dark:bg-indigo-900/40
                                        dark:text-indigo-300
                                    "
                                    >

                                        {role.permissions?.length ?? 0}

                                        {" "}Assigned

                                    </Badge>

                                </TableCell>

                                <TableCell>

                                    {role.isSystem ? (

                                        <Badge
                                            className="
                        bg-indigo-100
                        text-indigo-700
                        hover:bg-indigo-100
                        dark:bg-indigo-900/40
                        dark:text-indigo-300
                      "
                                        >
                                            System
                                        </Badge>

                                    ) : (

                                        <Badge
                                            className="
                        bg-lime-100
                        text-lime-700
                        hover:bg-lime-100
                        dark:bg-lime-900/40
                        dark:text-lime-300
                      "
                                        >
                                            Business
                                        </Badge>

                                    )}

                                </TableCell>

                                <TableCell>

                                    {role.active ? (

                                        <Badge
                                            className="
                        bg-lime-100
                        text-lime-700
                        hover:bg-lime-100
                        dark:bg-lime-900/40
                        dark:text-lime-300
                      "
                                        >
                                            Active
                                        </Badge>

                                    ) : (

                                        <Badge variant="destructive">

                                            Inactive

                                        </Badge>

                                    )}

                                </TableCell>

                                <TableCell className="text-right">

                                    <DropdownMenu>

                                        <DropdownMenuTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={loading}
                                                />
                                            }
                                        >

                                            <MoreHorizontal />

                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onView?.(role)
                                                }
                                            >

                                                <Eye />

                                                View

                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit?.(role)
                                                }
                                            >

                                                <Pencil />

                                                Edit

                                            </DropdownMenuItem>


                                            {role.active ? (

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDeactivate?.(role)
                                                    }
                                                >

                                                    <ShieldOff />

                                                    Deactivate

                                                </DropdownMenuItem>

                                            ) : (

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onActivate?.(role)
                                                    }
                                                >

                                                    <Shield />

                                                    Activate

                                                </DropdownMenuItem>

                                            )}

                                            {role.isSystem ? (

                                                <DropdownMenuItem
                                                    disabled
                                                >

                                                    <Shield />

                                                    System Role Protected

                                                </DropdownMenuItem>

                                            ) : (

                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        onDelete?.(role)
                                                    }
                                                >

                                                    <Trash2 />

                                                    Delete

                                                </DropdownMenuItem>

                                            )}

                                        </DropdownMenuContent>

                                    </DropdownMenu>

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>

        </div>

    );

}
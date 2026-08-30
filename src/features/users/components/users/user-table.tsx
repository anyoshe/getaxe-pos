
"use client";

import {
    MoreHorizontal,
    Pencil,
    UserCheck,
    UserX,
    Trash2,
} from "lucide-react";

import type {
    User,
} from "../../types";

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


interface UserTableProps {

    users: User[];

    loading?: boolean;

    onEdit?: (
        user: User
    ) => void;

    onActivate?: (
        user: User
    ) => void;

    onDeactivate?: (
        user: User
    ) => void;

    onDelete?: (
        user: User
    ) => void;

}


export function UserTable({
    users,
    loading = false,
    onEdit,
    onActivate,
    onDeactivate,
    onDelete,
}: UserTableProps) {


    return (

        <div className="
            overflow-hidden
            rounded-xl
            border
            bg-card
            shadow-sm
        ">

            <div className="overflow-x-auto">

                <Table className="min-w-[700px]">


                    <TableHeader>

                        <TableRow className="
                            bg-gradient-to-r
                            from-indigo-50
                            via-white
                            to-lime-50
                            dark:from-indigo-950/30
                            dark:via-background
                            dark:to-lime-950/20
                        ">


                            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">
                                Name
                            </TableHead>


                            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">
                                Email
                            </TableHead>


                            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">
                                Role
                            </TableHead>


                            <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">
                                Status
                            </TableHead>


                            <TableHead className="text-right font-semibold text-indigo-700 dark:text-indigo-300">
                                Actions
                            </TableHead>


                        </TableRow>

                    </TableHeader>



                    <TableBody>


                        {users.length === 0 && (

                            <TableRow>

                                <TableCell
                                    colSpan={5}
                                    className="py-12 text-center"
                                >

                                    <div className="
                                        flex
                                        flex-col
                                        items-center
                                        gap-2
                                    ">

                                        <p className="font-medium">
                                            No users found
                                        </p>

                                        <p className="
                                            text-sm
                                            text-muted-foreground
                                        ">
                                            Try adjusting your search or create a new user.
                                        </p>

                                    </div>

                                </TableCell>

                            </TableRow>

                        )}



                        {users.map((user) => (

                            <TableRow
                                key={user.id}
                                className="
                                    transition-colors
                                    hover:bg-primary/10
                                    dark:hover:bg-indigo-950/20
                                "
                            >


                                <TableCell className="font-medium">
                                    {user.name}
                                </TableCell>



                                <TableCell>
                                    {user.email}
                                </TableCell>



                                <TableCell>

                                    <span className="
                                        rounded-md
                                        bg-indigo-100
                                        px-2
                                        py-1
                                        text-xs
                                        font-medium
                                        text-indigo-700
                                        dark:bg-indigo-950
                                        dark:text-indigo-300
                                    ">
                                        {user.role?.name ?? "-"}
                                    </span>

                                </TableCell>



                                <TableCell>

                                    <Badge
                                        className={
                                            user.active
                                                ? `
                    bg-lime-100
                    text-lime-700
                    hover:bg-lime-100
                    dark:bg-lime-950
                    dark:text-lime-300
                `
                                                : `
                    bg-red-100
                    text-red-700
                    hover:bg-red-100
                    dark:bg-red-950
                    dark:text-red-300
                `
                                        }
                                    >

                                        {
                                            user.active
                                                ? "Active"
                                                : "Inactive"
                                        }

                                    </Badge>

                                </TableCell>




                                <TableCell className="text-right">


                                    <DropdownMenu>


                                        <DropdownMenuTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={loading}
                                                    className="
                                                        hover:bg-indigo-100
                                                        hover:text-indigo-700
                                                        dark:hover:bg-indigo-950
                                                    "
                                                />
                                            }
                                        >

                                            <MoreHorizontal className="size-5" />

                                        </DropdownMenuTrigger>



                                        <DropdownMenuContent
                                            align="end"
                                        >


                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit?.(user)
                                                }
                                            >

                                                <Pencil className="size-4" />

                                                Edit

                                            </DropdownMenuItem>



                                            {
                                                user.active
                                                    ? (

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onDeactivate?.(user)
                                                            }
                                                        >

                                                            <UserX className="size-4" />

                                                            Deactivate

                                                        </DropdownMenuItem>

                                                    )
                                                    : (

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onActivate?.(user)
                                                            }
                                                        >

                                                            <UserCheck className="size-4" />

                                                            Activate

                                                        </DropdownMenuItem>

                                                    )
                                            }



                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() =>
                                                    onDelete?.(user)
                                                }
                                            >

                                                <Trash2 className="size-4" />

                                                Delete

                                            </DropdownMenuItem>



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
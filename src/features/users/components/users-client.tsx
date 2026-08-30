"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Button,
} from "@/components/ui/button";

import {
    toast,
} from "sonner";

import {
    getUsersAction,
    getRolesAction,
    activateUserAction,
    deactivateUserAction,
    deleteUserAction,
} from "../actions";


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

import type {
    User,
} from "../types";


import {
    UserTable,
} from "./users/user-table";


import {
    UserToolbar,
} from "./users/user-toolbar";


import {
    UserDialog,
} from "./users/user-dialog";

interface Role {

    id: string;

    name: string;

}

export function UsersClient() {


    const [open, setOpen] =
        useState(false);



    const [users, setUsers] =
        useState<User[]>([]);

    const [search, setSearch] =
        useState("");

    const [roles, setRoles] =
        useState<Role[]>([]);

    const [roleId, setRoleId] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [page, setPage] =
        useState(1);

    const pageSize = 10;

    const [total, setTotal] =
        useState(0);

    const [loadingAction, setLoadingAction] =
        useState(false);

    const [selectedUser, setSelectedUser] =
        useState<User | undefined>();

    const [userToDelete, setUserToDelete] =
        useState<User | undefined>();



    async function loadUsers() {

        const result =
            await getUsersAction({
                search,
                roleId:
                    roleId || undefined,
                active:
                    status === ""
                        ? undefined
                        : status === "true",
                page,
                pageSize,
            });


        if (result.success) {

            setUsers(
                result.data?.items ?? [],
            );

            setTotal(
                result.data?.total ?? 0,
            );
        }

    }

    async function loadRoles() {

        const result =
            await getRolesAction();

        if (result.success) {

            setRoles(
                result.data ?? [],
            );

        }

    }



    useEffect(() => {

        loadUsers();

        loadRoles();

    }, [search, roleId, status, page]);



    function handleCreate() {

        setSelectedUser(undefined);

        setOpen(true);

    }





    function handleEdit(
        user: User
    ) {

        setSelectedUser(user);

        setOpen(true);

    }


    async function handleActivate(
        user: User
    ) {

        setLoadingAction(true);

        try {

            await activateUserAction(user.id);

            toast.success(
                "User activated successfully.",
            );

            await loadUsers();

        } catch {

            toast.error(
                "Failed to activate user.",
            );

        } finally {

            setLoadingAction(false);

        }

    }



    async function handleDeactivate(
        user: User
    ) {

        setLoadingAction(true);

        try {

            await deactivateUserAction(
                user.id,
            );

            toast.success(
                "User deactivated successfully.",
            );

            await loadUsers();

        } catch {

            toast.error(
                "Failed to deactivate user.",
            );

        } finally {

            setLoadingAction(false);

        }

    }



    function handleDelete(
        user: User
    ) {

        setUserToDelete(user);

    }

    const totalPages =
        Math.max(
            1,
            Math.ceil(total / pageSize),
        );

    return (

        <div className="space-y-6">

            {/* <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"> */}
            <div
                className="
        rounded-xl
        border
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-lime-50
        p-4
        shadow-sm
        sm:p-6
        dark:from-indigo-950/20
        dark:via-background
        dark:to-lime-950/20
    "
            >


                <UserToolbar
                    search={search}
                    roleId={roleId}
                    status={status}
                    roles={roles}
                    onSearchChange={setSearch}
                    onRoleChange={setRoleId}
                    onStatusChange={setStatus}
                    onCreate={handleCreate}
                />

                <UserTable

                    users={users}

                    loading={loadingAction}

                    onEdit={handleEdit}

                    onActivate={handleActivate}

                    onDeactivate={handleDeactivate}

                    onDelete={handleDelete}

                />


                <div
                    className="
        mt-6
        flex
        flex-col
        gap-3
        rounded-xl
        border
        bg-background/70
        p-4
        sm:flex-row
        sm:items-center
        sm:justify-between
    "
                >

                    <p className="text-sm text-muted-foreground">

                        Showing{" "}
                        <strong>
                            {users.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {total}
                        </strong>{" "}
                        users

                    </p>

                    <div className="flex items-center gap-2">

                        {/* <Button
                        variant="outline" */}
                        <Button
                            variant="outline"
                            className="
                            border-indigo-200
                            hover:bg-primary/10
                            hover:text-indigo-700
                            dark:border-indigo-900
                        "
                            disabled={page === 1}
                            onClick={() =>
                                setPage(
                                    (previous) =>
                                        previous - 1,
                                )
                            }
                        >
                            Previous
                        </Button>

                        <span
                            className="
                            rounded-lg
                            bg-indigo-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-indigo-700
                            dark:bg-indigo-950
                            dark:text-indigo-300
                        "
                        >

                            Page {page} of {totalPages}

                        </span>

                        <Button
                            variant="outline"
                            className="
                            border-indigo-200
                            hover:bg-primary/10
                            hover:text-indigo-700
                            dark:border-indigo-900
                        "
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage(
                                    (previous) =>
                                        previous + 1,
                                )
                            }
                        >
                            Next
                        </Button>

                    </div>

                </div>
            </div>

            <UserDialog

                open={open}

                onOpenChange={setOpen}

                user={selectedUser}

                onSuccess={loadUsers}

            />

            <AlertDialog
                open={!!userToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setUserToDelete(undefined);
                    }
                }}
            >
                <AlertDialogContent
                    className="
                            rounded-2xl
                            border
                            shadow-xl
                            sm:max-w-md
                        "
                >

                    <AlertDialogHeader
                        className="
                            rounded-xl
                            bg-gradient-to-r
                            from-red-50
                            via-white
                            to-orange-50
                            p-4
                            dark:from-red-950/30
                            dark:via-background
                            dark:to-orange-950/20
                        "
                    >

                        <AlertDialogTitle
                            className="
                            text-xl
                            font-bold
                            text-red-700
                            dark:text-red-300
                        "
                        >
                            Delete User
                        </AlertDialogTitle>

                        <AlertDialogDescription
                            className="
                                    text-sm
                                    leading-relaxed
                                "
                        >
                            Are you sure you want to delete{" "}
                            <strong>
                                {userToDelete?.name}
                            </strong>
                            ? This action cannot be undone.
                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel
                            className="
                                    border-indigo-200
                                    hover:bg-primary/10
                                    hover:text-indigo-700
                                    dark:border-indigo-900
                                "
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={loadingAction}
                            className="
                            bg-red-600
                            text-white
                            hover:bg-red-700
                            shadow-sm
                        "
                            onClick={async () => {

                                if (!userToDelete) {
                                    return;
                                }

                                setLoadingAction(true);

                                try {

                                    await deleteUserAction(
                                        userToDelete.id,
                                    );

                                    toast.success(
                                        "User deleted successfully.",
                                    );

                                    setUserToDelete(
                                        undefined,
                                    );

                                    await loadUsers();

                                } catch {

                                    toast.error(
                                        "Failed to delete user.",
                                    );

                                } finally {

                                    setLoadingAction(false);

                                }

                            }}
                        >
                            Delete User
                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>
        </div>

    );

}
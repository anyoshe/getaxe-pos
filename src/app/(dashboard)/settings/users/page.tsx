import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    UsersClient,
    RolesClient,
} from "@/features/users/components";

export default function UsersPage() {

    return (

        <div className="space-y-6">

            <div
                className="
                    rounded-2xl
                    border
                    bg-gradient-to-r
                    from-indigo-50 dark:from-indigo-950/40
                    via-background dark:via-card
                    to-lime-50 dark:to-background
                    p-6
                    shadow-sm
                    dark:from-indigo-950/30
                    dark:via-background
                    dark:to-lime-950/20
                "
            >

                <h1
                    className="
                        text-3xl
                        font-bold
                        text-indigo-700
                        dark:text-indigo-300
                    "
                >
                    Users & Roles
                </h1>

                <p className="mt-2 text-muted-foreground">

                    Manage users, roles and system permissions.

                </p>

            </div>

            <Tabs
                defaultValue="users"
                className="space-y-6"
            >

                <TabsList
                    className="
                        w-full
                        justify-start
                        rounded-xl
                        border
                        bg-card
                        p-1
                        dark:bg-card
                    "
                >

                    <TabsTrigger
                        value="users"
                        className="px-6"
                    >
                        Users
                    </TabsTrigger>

                    <TabsTrigger
                        value="roles"
                        className="px-6"
                    >
                        Roles
                    </TabsTrigger>

                </TabsList>

                <TabsContent value="users">

                    <UsersClient />

                </TabsContent>

                <TabsContent value="roles">

                    <RolesClient />

                </TabsContent>

            </Tabs>

        </div>

    );

}
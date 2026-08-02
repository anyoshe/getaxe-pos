// "use client";

// import {
//     useEffect,
//     useState,
// } from "react";

// import {
//     createUserAction,
//     updateUserAction,
//     getRolesAction,
// } from "../../actions";

// import type {
//     User,
// } from "../../types";


// interface Role {
//     id: string;
//     name: string;
// }
// import {
//     Input,
// } from "@/components/ui/input";

// import {
//     Label,
// } from "@/components/ui/label";

// import {
//     toast,
// } from "sonner";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";


// interface UserFormProps {

//     user?: User;

//     onSuccess?: () => void;

// }


// export function UserForm({
//     user,
//     onSuccess,
// }: UserFormProps) {


//     const [roles, setRoles] =
//         useState<Role[]>([]);


//     const [loading, setLoading] =
//         useState(false);

//     const [roleId, setRoleId] =
//         useState("");

//     useEffect(() => {

//         if (user) {

//             setRoleId(
//                 user.roleId ?? "",
//             );

//         }

//     }, [user]);

//     useEffect(() => {

//         async function loadRoles() {

//             const result =
//                 await getRolesAction();


//             if (result.success) {

//                 setRoles(
//                     result.data ?? []
//                 );

//             }

//         }


//         loadRoles();


//     }, []);




//     async function handleSubmit(
//         event: React.FormEvent<HTMLFormElement>
//     ) {

//         event.preventDefault();


//         const form =
//             new FormData(
//                 event.currentTarget
//             );


//         setLoading(true);



//         const data = {

//             name:
//                 String(form.get("name")),


//             email:
//                 String(form.get("email")),


//             phone:
//                 String(form.get("phone") || ""),


//             roleId,


//         };



//         let result;



//         if (user) {


//             result =
//                 await updateUserAction(
//                     user.id,
//                     data,
//                 );


//         } else {


//             result =
//                 await createUserAction({

//                     ...data,

//                     password:
//                         String(
//                             form.get("password")
//                         ),

//                 });


//         }



//         setLoading(false);



//         if (result.success) {

//             toast.success(
//                 user
//                     ? "User updated successfully."
//                     : "User created successfully.",
//             );

//             onSuccess?.();

//         } else {

//             toast.error(
//                 result.message ??
//                 (
//                     user
//                         ? "Failed to update user."
//                         : "Failed to create user."
//                 ),
//             );

//         }

//     }



//     return (

//         <form
//             onSubmit={handleSubmit}
//             className="space-y-4"
//         >


//             <div className="space-y-2">
//                 <Label htmlFor="name">
//                     Full Name
//                 </Label>

//                 <Input
//                     id="name"
//                     name="name"
//                     defaultValue={user?.name ?? ""}
//                     placeholder="Enter full name"
//                     required
//                 />
//             </div>


//             <div className="space-y-2">
//                 <Label htmlFor="email">
//                     Email Address
//                 </Label>

//                 <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     defaultValue={user?.email ?? ""}
//                     placeholder="name@company.com"
//                     required
//                 />
//             </div>



//             <div className="space-y-2">
//                 <Label htmlFor="phone">
//                     Phone Number
//                 </Label>

//                 <Input
//                     id="phone"
//                     name="phone"
//                     type="tel"
//                     defaultValue={user?.phone ?? ""}
//                     placeholder="+254 7XX XXX XXX"
//                 />
//             </div>


//             {!user && (

//                 <div className="space-y-2">
//                     <Label htmlFor="password">
//                         Password
//                     </Label>

//                     <Input
//                         id="password"
//                         name="password"
//                         type="password"
//                         placeholder="Enter a secure password"
//                         required
//                     />
//                 </div>

//             )}



//             <div className="space-y-2">

//                 <Label>
//                     Role
//                 </Label>

//                 <Select
//                     value={roleId}
//                     onValueChange={(value) => {
//                         setRoleId(value ?? "");
//                     }}
//                 >

//                     <SelectTrigger className="w-full">

//                         <SelectValue>
//                             {
//                                 roles.find(
//                                     (role) => role.id === roleId
//                                 )?.name ?? "Select Role"
//                             }
//                         </SelectValue>

//                     </SelectTrigger>

//                     <SelectContent>

//                         {roles.map((role) => (

//                             <SelectItem
//                                 key={role.id}
//                                 value={role.id}
//                             >
//                                 {role.name}
//                             </SelectItem>

//                         ))}

//                     </SelectContent>

//                 </Select>

//             </div>




//             <button
//                 disabled={loading}
//                 className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//                 {
//                     loading
//                         ? user
//                             ? "Updating..."
//                             : "Creating..."
//                         : user
//                             ? "Update User"
//                             : "Create User"
//                 }
//             </button>



//         </form>

//     );

// }

"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    createUserAction,
    updateUserAction,
    getRolesAction,
} from "../../actions";

import type {
    User,
} from "../../types";


interface Role {
    id: string;
    name: string;
}

import {
    Input,
} from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";

import {
    toast,
} from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface UserFormProps {

    user?: User;

    onSuccess?: () => void;

}



export function UserForm({
    user,
    onSuccess,
}: UserFormProps) {


    const [roles, setRoles] =
        useState<Role[]>([]);


    const [loading, setLoading] =
        useState(false);


    const [roleId, setRoleId] =
        useState("");



    useEffect(() => {

        if (user) {

            setRoleId(
                user.roleId ?? "",
            );

        }

    }, [user]);



    useEffect(() => {

        async function loadRoles() {

            const result =
                await getRolesAction();


            if (result.success) {

                setRoles(
                    result.data ?? []
                );

            }

        }


        loadRoles();


    }, []);





    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        setLoading(true);



        const data = {

            name:
                String(form.get("name")),


            email:
                String(form.get("email")),


            phone:
                String(form.get("phone") || ""),


            roleId,

        };



        let result;



        if (user) {

            result =
                await updateUserAction(
                    user.id,
                    data,
                );


        } else {

            result =
                await createUserAction({

                    ...data,

                    password:
                        String(
                            form.get("password")
                        ),

                });

        }



        setLoading(false);



        if (result.success) {

            toast.success(
                user
                    ? "User updated successfully."
                    : "User created successfully.",
            );

            onSuccess?.();


        } else {

            toast.error(
                result.message ??
                (
                    user
                        ? "Failed to update user."
                        : "Failed to create user."
                ),
            );

        }

    }



    return (

        <form
            onSubmit={handleSubmit}
            className="
                space-y-5
            "
        >


            <div className="grid gap-4">


                <div className="space-y-2">

                    <Label htmlFor="name">
                        Full Name
                    </Label>

                    <Input
                        id="name"
                        name="name"
                        defaultValue={user?.name ?? ""}
                        placeholder="Enter full name"
                        className="
                            focus-visible:ring-indigo-500
                        "
                        required
                    />

                </div>




                <div className="space-y-2">

                    <Label htmlFor="email">
                        Email Address
                    </Label>

                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.email ?? ""}
                        placeholder="name@company.com"
                        className="
                            focus-visible:ring-indigo-500
                        "
                        required
                    />

                </div>




                <div className="space-y-2">

                    <Label htmlFor="phone">
                        Phone Number
                    </Label>

                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={user?.phone ?? ""}
                        placeholder="+254 7XX XXX XXX"
                        className="
                            focus-visible:ring-indigo-500
                        "
                    />

                </div>




                {!user && (

                    <div className="space-y-2">

                        <Label htmlFor="password">
                            Password
                        </Label>

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter a secure password"
                            className="
                                focus-visible:ring-indigo-500
                            "
                            required
                        />

                    </div>

                )}






                <div className="space-y-2">

                    <Label>
                        Role
                    </Label>


                    <Select
                        value={roleId}
                        onValueChange={(value) => {
                            setRoleId(value ?? "");
                        }}
                    >

                        <SelectTrigger
                            className="
                                w-full
                                focus:ring-indigo-500
                            "
                        >

                            <SelectValue>
                                {
                                    roles.find(
                                        (role) =>
                                            role.id === roleId
                                    )?.name ?? "Select Role"
                                }
                            </SelectValue>


                        </SelectTrigger>


                        <SelectContent>

                            {
                                roles.map(
                                    (role) => (

                                        <SelectItem
                                            key={role.id}
                                            value={role.id}
                                        >

                                            {role.name}

                                        </SelectItem>

                                    )
                                )
                            }


                        </SelectContent>


                    </Select>


                </div>


            </div>





            <button

                disabled={loading}

                className="
                    w-full
                    rounded-lg
                    bg-indigo-600
                    px-4
                    py-2.5
                    font-medium
                    text-white
                    transition
                    hover:bg-indigo-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:bg-indigo-500
                    dark:hover:bg-indigo-600
                "

            >

                {
                    loading
                        ? user
                            ? "Updating..."
                            : "Creating..."
                        : user
                            ? "Update User"
                            : "Create User"
                }


            </button>



        </form>

    );

}
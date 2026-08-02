// "use client";

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";

// import {
//     UserForm,
// } from "./user-form";

// import type {
//     User,
// } from "../../types";


// interface UserDialogProps {

//     open: boolean;

//     onOpenChange:
//     (open: boolean) => void;

//     user?: User;

//     onSuccess?: () => void;

// }



// export function UserDialog({
//     open,
//     onOpenChange,
//     user,
//     onSuccess,
// }: UserDialogProps) {


//     return (

//         <Dialog
//             open={open}
//             onOpenChange={onOpenChange}
//         >


//             <DialogContent>


//                 <DialogHeader>

//                     <DialogTitle>

//                         {
//                             user
//                             ? "Edit User"
//                             : "Create User"
//                         }

//                     </DialogTitle>

//                 </DialogHeader>



//                 <UserForm

//                     user={user}

//                     onSuccess={() => {

//                         onOpenChange(false);

//                         onSuccess?.();

//                     }}

//                 />


//             </DialogContent>


//         </Dialog>

//     );

// }

"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    UserForm,
} from "./user-form";

import type {
    User,
} from "../../types";


interface UserDialogProps {

    open: boolean;

    onOpenChange:
    (open: boolean) => void;

    user?: User;

    onSuccess?: () => void;

}



export function UserDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserDialogProps) {


    return (

        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >


            <DialogContent
                className="
                    w-[95vw]
                    max-w-lg
                    rounded-2xl
                    border
                    shadow-xl
                "
            >


                <DialogHeader
                    className="
                        rounded-xl
                        bg-gradient-to-r
                        from-indigo-50
                        via-white
                        to-lime-50
                        p-4
                        dark:from-indigo-950/30
                        dark:via-background
                        dark:to-lime-950/20
                    "
                >

                    <DialogTitle
                        className="
                            text-xl
                            font-bold
                            text-indigo-700
                            dark:text-indigo-300
                        "
                    >

                        {
                            user
                                ? "Edit User"
                                : "Create User"
                        }

                    </DialogTitle>


                    <p className="
                        text-sm
                        text-muted-foreground
                    ">
                        {
                            user
                                ? "Update user details and access settings."
                                : "Create a new system user and assign permissions."
                        }
                    </p>


                </DialogHeader>




                <div className="pt-2">

                    <UserForm

                        user={user}

                        onSuccess={() => {

                            onOpenChange(false);

                            onSuccess?.();

                        }}

                    />

                </div>


            </DialogContent>


        </Dialog>

    );

}
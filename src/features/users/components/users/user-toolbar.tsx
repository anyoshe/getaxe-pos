// "use client";

// import {
//   Input,
// } from "@/components/ui/input";

// import {
//   Button,
// } from "@/components/ui/button";

// import {
//   Search,
//   Plus,
// } from "lucide-react";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface Role {

//   id: string;

//   name: string;

// }

// interface UserToolbarProps {

//   search: string;

//   roleId: string;

//   status: string;

//   roles: Role[];

//   onSearchChange: (
//     value: string,
//   ) => void;

//   onRoleChange: (
//     value: string,
//   ) => void;

//   onStatusChange: (
//     value: string,
//   ) => void;

//   onCreate: () => void;

// }

// export function UserToolbar({
//   search,
//   roleId,
//   status,
//   roles,
//   onSearchChange,
//   onRoleChange,
//   onStatusChange,
//   onCreate,
// }: UserToolbarProps) {

//   return (

//     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//       <div>

//         <h2 className="text-2xl font-bold">
//           User Management
//         </h2>

//         <p className="text-sm text-muted-foreground">
//           Manage system users.
//         </p>

//       </div>

//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

//         <div className="relative">

//           <Search
//             className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
//           />

//           <Input
//             value={search}
//             onChange={(e) =>
//               onSearchChange(
//                 e.target.value,
//               )
//             }
//             placeholder="Search users..."
//             className="w-full pl-9 sm:w-72"
//           />

//         </div>
//         <Select
//           value={roleId}
//           onValueChange={(value) =>
//             onRoleChange(
//               value === "all"
//                 ? ""
//                 : value ?? "",
//             )
//           }
//         >

//           <SelectTrigger className="w-full sm:w-56">

//             <SelectValue>
//               {
//                 roleId === ""
//                   ? "All Roles"
//                   : roles.find(
//                     (role) => role.id === roleId,
//                   )?.name ?? "All Roles"
//               }
//             </SelectValue>

//           </SelectTrigger>

//           <SelectContent>

//             <SelectItem value="all">
//               All Roles
//             </SelectItem>

//             {roles.map((role) => (

//               <SelectItem
//                 key={role.id}
//                 value={role.id}
//               >
//                 {role.name}
//               </SelectItem>

//             ))}

//           </SelectContent>

//         </Select>

//         <Select
//           value={status || "all"}
//           onValueChange={(value) =>
//             onStatusChange(
//               value === "all"
//                 ? ""
//                 : value ?? "",
//             )
//           }
//         >

//           <SelectTrigger className="w-full sm:w-40">

//             <SelectValue>
//               {
//                 status === ""
//                   ? "All Status"
//                   : status === "true"
//                     ? "Active"
//                     : "Inactive"
//               }
//             </SelectValue>

//           </SelectTrigger>

//           <SelectContent>

//             <SelectItem value="all">
//               All Status
//             </SelectItem>

//             <SelectItem value="true">
//               Active
//             </SelectItem>

//             <SelectItem value="false">
//               Inactive
//             </SelectItem>

//           </SelectContent>

//         </Select>

//         <Button
//           onClick={onCreate}
//         >

//           <Plus className="size-4" />

//           Add User

//         </Button>

//       </div>

//     </div>

//   );

// }

"use client";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  Search,
  Plus,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface Role {

  id: string;

  name: string;

}


interface UserToolbarProps {

  search: string;

  roleId: string;

  status: string;

  roles: Role[];

  onSearchChange: (
    value: string,
  ) => void;

  onRoleChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: string,
  ) => void;

  onCreate: () => void;

}



export function UserToolbar({
  search,
  roleId,
  status,
  roles,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onCreate,
}: UserToolbarProps) {


  const selectedRole =
    roles.find(
      (role) =>
        role.id === roleId
    );


  return (

    <div className="
            rounded-xl
            border
            bg-gradient-to-r
            from-indigo-50
            via-white
            to-lime-50
            p-4
            shadow-sm
            dark:from-indigo-950/30
            dark:via-background
            dark:to-lime-950/20
        ">

      <div className="flex flex-col gap-4">
        <div>

          <h2 className="
                        text-2xl
                        font-bold
                        text-indigo-700
                        dark:text-indigo-300
                    ">
            User Management
          </h2>


          <p className="
                        text-sm
                        text-muted-foreground
                    ">
            Manage system users and access.
          </p>


        </div>



        <div className="
    flex
    flex-col
    gap-3
    md:flex-row
    md:items-center
">

          <div className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:flex-wrap
    ">

            <div className="relative">

              <Search
                className="
                                absolute
                                left-3
                                top-1/2
                                size-4
                                -translate-y-1/2
                                text-indigo-500
                            "
              />


              <Input

                value={search}

                onChange={(e) =>
                  onSearchChange(
                    e.target.value
                  )
                }

                placeholder="Search users..."

                className="
                                pl-9
                                sm:w-64
                                focus-visible:ring-indigo-500
                            "

              />

            </div>





            <Select

              value={
                roleId || "all"
              }

              onValueChange={(value) =>
                onRoleChange(
                  value === "all" || value === null
                    ? ""
                    : value,
                )
              }

            >

              <SelectTrigger
                className="
                                w-full
                                sm:w-48
                            "
              >

                <SelectValue>

                  {
                    selectedRole?.name
                    ??
                    "All Roles"
                  }

                </SelectValue>


              </SelectTrigger>


              <SelectContent>


                <SelectItem value="all">

                  All Roles

                </SelectItem>


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






            <Select

              value={
                status || "all"
              }

              onValueChange={(value) =>
                onStatusChange(
                  value === "all" || value === null
                    ? ""
                    : value,
                )
              }

            >


              <SelectTrigger
                className="
                                w-full
                                sm:w-36
                            "
              >

                <SelectValue>

                  {
                    status === ""
                      ? "All Status"
                      : status === "true"
                        ? "Active"
                        : "Inactive"
                  }

                </SelectValue>


              </SelectTrigger>



              <SelectContent>


                <SelectItem value="all">

                  All Status

                </SelectItem>


                <SelectItem value="true">

                  Active

                </SelectItem>


                <SelectItem value="false">

                  Inactive

                </SelectItem>


              </SelectContent>


            </Select>


          </div>



          <Button

            onClick={onCreate}

            className="
                md:ml-auto
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                gap-2
        " >

            <Plus className="size-4" />

            Add User


          </Button>



        </div>


      </div>


    </div>

  );

}
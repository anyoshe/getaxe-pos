// export interface AuthUser {
//   id: string;
//   businessId: string;
//   roleId: string;

//   name: string;
//   email: string;
//   phone: string | null;

//   active: boolean;

//   role: {
//     id: string;
//     name: string;
//     isSystem: boolean;
//   };
// }

export interface AuthenticatedUser {

  type: "USER";

  id: string;

  businessId: string;

  roleId: string;

  name: string;

  email: string;

  phone: string | null;

  active: boolean;

  role: {
    id: string;
    name: string;
    isSystem: boolean;
  };

}

export interface InvitedBusinessOwner {

  type: "INVITATION";

  id: string;

  email: string;

  name: string;

  phone: string | null;

  roleId: string;

}

export type AuthUser =
  | AuthenticatedUser
  | InvitedBusinessOwner;
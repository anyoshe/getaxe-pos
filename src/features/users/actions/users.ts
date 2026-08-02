"use server";

import {
  userService,
} from "../services";

import {
  requireAuthorizedUser,
} from "@/lib/auth/authorize";

export async function getUsersAction(
    options?: {
        search?: string;
        roleId?: string;
        active?: boolean;
        page?: number;
        pageSize?: number;
    },
) {
    try {

        await requireAuthorizedUser(
            "users.view",
        );

        const users =
            await userService.getUsers(
                options,
            );

        return {
            success: true,
            data: users,
        };

    } catch {

        return {
            success: false,
            message:
                "Failed to load users",
        };

    }
}


export async function createUserAction(
  data: Omit<
    Parameters<
      typeof userService.createUser
    >[0],
    "businessId"
  >,
) {
  try {

  await requireAuthorizedUser(
    "users.create"
  );

  const {
    requireCurrentUser,
  } = await import("@/lib/auth/current-user");


    const currentUser =
      await requireCurrentUser();


    const user =
      await userService.createUser({
        ...data,
        businessId:
          currentUser.businessId,
      });


    return {
      success: true,
      data: user,
      message: "User created successfully",
    };

  } catch {

    return {
      success: false,
      message: "Failed to create user",
    };

  }
}

export async function updateUserAction(
  id: string,
  data: Parameters<
    typeof userService.updateUser
  >[1],
) {
  try {

  await requireAuthorizedUser(
    "users.update"
  );

  const user =
    await userService.updateUser(
        id,
        data,
      );

    return {
      success: true,
      data: user,
      message: "User updated successfully",
    };

  } catch {

    return {
      success: false,
      message: "Failed to update user",
    };

  }
}

export async function activateUserAction(
  id: string,
) {

  await requireAuthorizedUser(
    "users.activate"
  );

  return userService.activateUser(id);

}


export async function deactivateUserAction(
  id: string,
) {

  await requireAuthorizedUser(
    "users.deactivate"
  );

  return userService.deactivateUser(id);

}


export async function deleteUserAction(
  id: string,
) {

  await requireAuthorizedUser(
    "users.delete"
  );

  return userService.deleteUser(id);

}
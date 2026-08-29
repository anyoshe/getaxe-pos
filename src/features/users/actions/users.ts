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

    const {
      requireCurrentUser,
    } = await import("@/lib/auth/current-user");

    const currentUser =
      await requireCurrentUser();

    const users =
      await userService.getUsers(
        currentUser.businessId,
        options,
      );

    return {
      success: true,
      data: users,
    };

  } catch {
    return {
      success: false,
      message: "Failed to load users",
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
import { revalidatePath } from "next/cache";
import { userPermissionRepository } from "@/repositories/users/user-permission.repository";
import { rolePermissionRepository } from "@/repositories/users/role-permission.repository";
import { userRepository } from "@/repositories/users/user.repository";

export async function getUserPermissionOverridesAction(userId: string) {
  try {
    await requireAuthorizedUser("users.update");
    const overrides = await userPermissionRepository.listOverrides(userId);
    const { requireCurrentUser } = await import("@/lib/auth/current-user");
    const current = await requireCurrentUser();
    const user = await userRepository.findById(userId, current.businessId);
    let rolePermissionIds: string[] = [];
    if (user?.roleId) {
      const rolePerms = await rolePermissionRepository.findByRole(user.roleId);
      rolePermissionIds = rolePerms.map((p) => p.id);
    }
    return {
      success: true as const,
      data: {
        grants: overrides.filter((o) => o.effect === "grant").map((o) => o.id),
        denies: overrides.filter((o) => o.effect === "deny").map((o) => o.id),
        rolePermissionIds,
        overrides,
      },
    };
  } catch {
    return { success: false as const, message: "Failed to load user permissions" };
  }
}

export async function updateUserPermissionOverridesAction(
  userId: string,
  grants: string[],
  denies: string[],
) {
  try {
    await requireAuthorizedUser("users.update");
    await userPermissionRepository.replaceOverrides(userId, grants, denies);
    revalidatePath("/settings/users");
    return {
      success: true as const,
      message: "User permissions updated",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to update permissions",
    };
  }
}

 import {
  roleRepository,
  rolePermissionRepository,
  userRepository,
} from "@/repositories";

export class RoleService {

  async getRoles() {
    const roles = await roleRepository.findAll();

    return roles.map((role) => ({
        ...role,
        permissions: role.rolePermissions.map(
            (rp) => rp.permission,
        ),
    }));
}

  async getRole(
    id: string,
) {
    const role = await roleRepository.findById(id);

    if (!role) {
        return null;
    }

    return {
        ...role,
        permissions: role.rolePermissions.map(
            (rp) => rp.permission,
        ),
    };
}

  async createRole(
    data: Parameters<
      typeof roleRepository.create
    >[0],
  ) {
    return roleRepository.create(data);
  }

  async updateRole(
    id: string,
    data: Parameters<
      typeof roleRepository.update
    >[1],
  ) {
    return roleRepository.update(
      id,
      data,
    );
  }

  async activateRole(
    id: string,
  ) {
    return roleRepository.activate(id);
  }

  async deactivateRole(
    id: string,
  ) {
    return roleRepository.deactivate(id);
  }

 async deleteRole(
  id: string,
) {

  const assignedUsers =
    await userRepository.countByRole(
      id,
    );


  if (assignedUsers > 0) {

    throw new Error(
      "Cannot delete a role assigned to users",
    );

  }


  return roleRepository.delete(
    id,
  );

}

  // -------------------------------------------------
  // Role Permissions
  // -------------------------------------------------

  async getRolePermissions(
    roleId: string,
  ) {
    return rolePermissionRepository.findByRole(
      roleId,
    );
  }

  async getRoleUsers(
  roleId: string,
) {

  return roleRepository.findUsers(
    roleId,
  );

}

  async assignPermission(
    roleId: string,
    permissionId: string,
  ) {
    return rolePermissionRepository.assignIfMissing(
      roleId,
      permissionId,
    );
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ) {
    return rolePermissionRepository.remove(
      roleId,
      permissionId,
    );
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
  ) {

    await rolePermissionRepository.removeAll(
      roleId,
    );

    for (const permissionId of permissionIds) {

      await rolePermissionRepository.assign(
        roleId,
        permissionId,
      );

    }

    return this.getRolePermissions(
      roleId,
    );

  }

  async getSystemRoleByName(
  name: string,
) {

  return roleRepository.findByName(
    name,
  );

}

}

export const roleService =
  new RoleService();
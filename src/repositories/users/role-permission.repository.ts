import {
  and,
  eq,
} from "drizzle-orm";

import {
  Repository,
} from "../base/repository";

import {
  rolePermissions,
} from "@/db/schema/users/role_permissions";

import {
  permissions,
} from "@/db/schema/users/permissions";


export class RolePermissionRepository {


  async findByRole(
    roleId: string,
  ) {
    return Repository.db
      .select({
        id: permissions.id,
        code: permissions.code,
        module: permissions.module,
        name: permissions.name,
        description: permissions.description,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(
          rolePermissions.permissionId,
          permissions.id,
        ),
      )
      .where(
        eq(
          rolePermissions.roleId,
          roleId,
        ),
      );
  }


  async exists(
    roleId: string,
    permissionId: string,
  ) {
    const record =
      await Repository.db.query.rolePermissions.findFirst({
        where: and(
          eq(
            rolePermissions.roleId,
            roleId,
          ),
          eq(
            rolePermissions.permissionId,
            permissionId,
          ),
        ),
      });

    return !!record;
  }


  async findOne(
    roleId: string,
    permissionId: string,
  ) {
    return Repository.db.query.rolePermissions.findFirst({
      where: and(
        eq(
          rolePermissions.roleId,
          roleId,
        ),
        eq(
          rolePermissions.permissionId,
          permissionId,
        ),
      ),
    });
  }


  async assign(
    roleId: string,
    permissionId: string,
  ) {
    return Repository.db
      .insert(rolePermissions)
      .values({
        roleId,
        permissionId,
      })
      .onConflictDoNothing();
  }


  async assignIfMissing(
    roleId: string,
    permissionId: string,
  ) {
    const exists =
      await this.exists(
        roleId,
        permissionId,
      );

    if (!exists) {
      return this.assign(
        roleId,
        permissionId,
      );
    }

    return null;
  }


  async remove(
    roleId: string,
    permissionId: string,
  ) {
    return Repository.db
      .delete(rolePermissions)
      .where(
        and(
          eq(
            rolePermissions.roleId,
            roleId,
          ),
          eq(
            rolePermissions.permissionId,
            permissionId,
          ),
        ),
      );
  }


  async removeAll(
    roleId: string,
  ) {
    return Repository.db
      .delete(rolePermissions)
      .where(
        eq(
          rolePermissions.roleId,
          roleId,
        ),
      );
  }

}


export const rolePermissionRepository =
  new RolePermissionRepository();
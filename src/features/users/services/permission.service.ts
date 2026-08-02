import {
  permissionRepository,
} from "@/repositories";


export class PermissionService {


  async getPermissions() {
    return permissionRepository.findAll();
  }


  async getPermission(
    id: string,
  ) {
    return permissionRepository.findById(id);
  }


  async getPermissionByCode(
    code: string,
  ) {
    return permissionRepository.findByCode(code);
  }


  async upsertPermission(
    data: {
      code: string;
      module: string;
      name: string;
      description: string | null;
    },
  ) {
    return permissionRepository.upsert(data);
  }


  async activatePermission(
    id: string,
  ) {
    return permissionRepository.activate(id);
  }


  async deactivatePermission(
    id: string,
  ) {
    return permissionRepository.deactivate(id);
  }


  async deletePermission(
    id: string,
  ) {
    return permissionRepository.delete(id);
  }


}


export const permissionService =
  new PermissionService();
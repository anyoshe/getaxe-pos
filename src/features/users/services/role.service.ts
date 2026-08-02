import {
  roleRepository,
} from "@/repositories";


export class RoleService {

  async getRoles() {
    return roleRepository.findAll();
  }


  async getRole(
    id: string,
  ) {
    return roleRepository.findById(id);
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
    return roleRepository.delete(id);
  }


}


export const roleService =
  new RoleService();
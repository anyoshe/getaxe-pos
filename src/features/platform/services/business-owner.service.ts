import {
  platformUserRepository,
} from "@/repositories";

export class BusinessOwnerService {

  async getBusinessOwners() {
    return platformUserRepository.findBusinessOwners();
  }

  async updateBusinessOwner(
    id: string,
    data: Parameters<
      typeof platformUserRepository.update
    >[1],
  ) {

    return platformUserRepository.update(
      id,
      data,
    );

  }

}

export const businessOwnerService =
  new BusinessOwnerService();
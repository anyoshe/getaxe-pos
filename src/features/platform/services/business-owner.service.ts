import {
  platformUserRepository,
} from "@/repositories";

export class BusinessOwnerService {

  async getBusinessOwners() {
    return platformUserRepository.findBusinessOwners();
  }

}

export const businessOwnerService =
  new BusinessOwnerService();
import { platformUserService } from "./platform-user.service";

/** @deprecated Prefer platformUserService — kept for provisioning link step */
export class BusinessOwnerService {
  async getBusinessOwners() {
    return platformUserService.listInvitations();
  }

  async updateBusinessOwner(
    id: string,
    data: { businessId?: string | null },
  ) {
    // Invitations table has no businessId column — no-op safe for provision link
    void id;
    void data;
    return null;
  }
}

export const businessOwnerService = new BusinessOwnerService();

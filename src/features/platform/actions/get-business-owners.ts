"use server";

import {
  businessOwnerService,
} from "../services/business-owner.service";


export async function getBusinessOwnersAction() {

  const owners =
    await businessOwnerService.getBusinessOwners();

  return {
    success: true,
    data: owners,
  };

}
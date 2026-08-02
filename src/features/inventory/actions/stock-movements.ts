"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  stockMovementService,
} from "../services";

export async function getStockMovements(
  businessId: string
) {
  await requireAuthorizedUser(
    "stock-movements.view"
  );

  return stockMovementService.getStockMovements(
    businessId
  );
}

export async function getStockMovement(
  id: string
) {
  await requireAuthorizedUser(
    "stock-movements.view"
  );

  return stockMovementService.getStockMovement(
    id
  );
}
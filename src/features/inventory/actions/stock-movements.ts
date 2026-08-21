"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  stockMovementService,
} from "../services";

export async function getStockMovements(
  businessId: string
) {
  await requireAuthorizedUser(
    "stock_movements.view"
  );

  return stockMovementService.getStockMovements(
    businessId
  );
}

export async function getStockMovement(
  id: string
) {
  const user =
  await requireAuthorizedUser(
    "stock_movements.view"
  );

  return stockMovementService.getStockMovement(
  id,
  user.businessId
);
}
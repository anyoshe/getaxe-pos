export interface Warehouse {
  id: string;

  businessId: string;

  branchId: string;

  code: string;

  name: string;

  description: string | null;

  active: boolean;

  createdAt: Date;

  updatedAt: Date;

  branch?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface WarehouseListItem
  extends Warehouse {}

export interface WarehouseOption {
  id: string;
  code: string;
  name: string;
}

export interface WarehouseFilters {
  search?: string;
  branchId?: string;
  active?: boolean;
}
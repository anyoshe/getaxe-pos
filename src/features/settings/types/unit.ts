export interface Unit {
  id: string;

  businessId: string | null;

  code: string;

  name: string;

  symbol: string | null;

  description: string | null;

  active: boolean;

  createdAt: Date;

  updatedAt: Date;
}


export interface UnitListItem
  extends Unit {}


export interface UnitOption {
  id: string;

  code: string;

  name: string;

  symbol: string | null;
}


export interface UnitFilters {
  search?: string;

  active?: boolean;
}
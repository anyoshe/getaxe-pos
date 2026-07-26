export interface Branch {
  id: string;

  businessId: string;

  code: string;

  name: string;

  phone: string | null;

  email: string | null;

  county: string | null;

  town: string | null;

  address: string | null;

  active: boolean;

  isHeadOffice: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export interface BranchListItem extends Branch {}

export interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export interface BranchFilters {
  search?: string;
  active?: boolean;
}
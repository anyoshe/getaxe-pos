export interface AuthUser {
  id: string;
  businessId: string;
  roleId: string;

  name: string;
  email: string;
  phone: string | null;

  active: boolean;

  role: {
    id: string;
    name: string;
    isSystem: boolean;
  };
}
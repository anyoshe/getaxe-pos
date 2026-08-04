export interface PlatformUser {

  id: string;

  email: string;

  passwordHash: string;

  name: string;

  role: string;

  active: boolean;

  createdAt: Date;

}
export type UserRole =
  | 'VOTER'
  | 'MP'
  | 'CONSTITUENCY_ADMIN'
  | 'CENTRAL_GOV_ADMIN'
  | 'DEVELOPER';

export interface AuthUser {
  id: string;
  email?: string;
  icNumber?: string;
  role: UserRole;
  constituencyId?: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

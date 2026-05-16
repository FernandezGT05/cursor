export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

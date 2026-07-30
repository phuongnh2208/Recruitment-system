/**
 * Auth type definitions.
 */

export type UserRole = "STUDENT" | "EMPLOYER" | "ADMINISTRATOR";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  companyName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * Auth API service layer.
 */

import { axiosInstance } from "../../../core/api/axios";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";

async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>(
    ENDPOINTS.AUTH.LOGIN,
    payload,
  );
  return response.data;
}

async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>(
    ENDPOINTS.AUTH.REGISTER,
    payload,
  );
  return response.data;
}

async function logout(): Promise<void> {
  await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
}

export const authService = {
  login,
  register,
  logout,
};

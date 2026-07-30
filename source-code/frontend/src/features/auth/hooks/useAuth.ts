/**
 * Auth hooks for login, register, and logout.
 */

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import type { LoginRequest, RegisterRequest } from "../types/auth.types";
import { useToast } from "../../../core/components/useToast";

const ROLE_HOME_PATHS: Record<string, string> = {
  STUDENT: "/student/jobs",
  EMPLOYER: "/employer/jobs",
  ADMINISTRATOR: "/admin/dashboard",
};

export function useLogin() {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id);

      toast.showToast({ type: "success", message: "Đăng nhập thành công" });
      const home = ROLE_HOME_PATHS[data.user.role] ?? "/student/jobs";
      navigate(home, { replace: true });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.showToast({ type: "error", message });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id);

      toast.showToast({ type: "success", message: "Đăng ký thành công" });
      const home = ROLE_HOME_PATHS[data.user.role] ?? "/student/jobs";
      navigate(home, { replace: true });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      toast.showToast({ type: "error", message });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      toast.showToast({ type: "success", message: "Đã đăng xuất" });
      navigate("/login", { replace: true });
    },
  });
}

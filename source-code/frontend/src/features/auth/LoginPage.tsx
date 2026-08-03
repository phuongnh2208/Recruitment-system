/**
 * Login Page - allows users to sign in.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "./schemas/auth.schema";
import { useLogin } from "./hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Đăng nhập
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              Đăng nhập để tiếp tục sử dụng hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Email <span className="text-danger">*</span>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? "border-danger" : "border-ink/15"
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <span className="mt-1 block font-body text-xs text-danger" role="alert">
                    {errors.email.message}
                  </span>
                )}
              </label>
            </div>

            <div>
              <label htmlFor="password" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Mật khẩu <span className="text-danger">*</span>
                </span>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="********"
                    className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-12 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.password ? "border-danger" : "border-ink/15"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs text-ink/50 hover:text-ink"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                {errors.password && (
                  <span className="mt-1 block font-body text-xs text-danger" role="alert">
                    {errors.password.message}
                  </span>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-sage disabled:text-ink/40"
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-ink/60">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

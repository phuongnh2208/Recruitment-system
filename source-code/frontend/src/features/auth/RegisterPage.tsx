/**
 * Register Page - allows new users to sign up.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "./schemas/auth.schema";
import { useRegister } from "./hooks/useAuth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
      fullName: "",
      companyName: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      role: values.role,
      fullName: values.fullName,
      companyName: values.companyName,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Đăng ký
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              Tạo tài khoản mới để bắt đầu
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
              <span className="font-body text-sm font-medium text-ink">
                Vai tro <span className="text-danger">*</span>
              </span>
              <div className="mt-1.5 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="STUDENT"
                    {...register("role")}
                    className="text-primary focus:ring-primary/20"
                  />
                  <span className="font-body text-sm text-ink">Sinh viên</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="EMPLOYER"
                    {...register("role")}
                    className="text-primary focus:ring-primary/20"
                  />
                  <span className="font-body text-sm text-ink">Nhà tuyển dụng</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  {selectedRole === "EMPLOYER" ? "Người đại diện" : "Họ tên"}{" "}
                  <span className="text-danger">*</span>
                </span>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.fullName ? "border-danger" : "border-ink/15"
                  }`}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <span className="mt-1 block font-body text-xs text-danger" role="alert">
                    {errors.fullName.message}
                  </span>
                )}
              </label>
            </div>

            {selectedRole === "EMPLOYER" && (
              <div>
                <label htmlFor="companyName" className="block">
                  <span className="font-body text-sm font-medium text-ink">
                    Tên công ty <span className="text-danger">*</span>
                  </span>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="Công ty ABC"
                    className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.companyName ? "border-danger" : "border-ink/15"
                    }`}
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <span className="mt-1 block font-body text-xs text-danger" role="alert">
                      {errors.companyName.message}
                    </span>
                  )}
                </label>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Mật khẩu <span className="text-danger">*</span>
                </span>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Xác nhận mật khẩu <span className="text-danger">*</span>
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="********"
                  className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.confirmPassword ? "border-danger" : "border-ink/15"
                  }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <span className="mt-1 block font-body text-xs text-danger" role="alert">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-sage disabled:text-ink/40"
            >
              {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-ink/60">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


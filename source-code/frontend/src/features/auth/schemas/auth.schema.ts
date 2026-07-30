import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    role: z.enum(["STUDENT", "EMPLOYER"]),
    fullName: z.string().min(1, "Họ tên là bắt buộc"),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.role !== "EMPLOYER" ||
      (data.companyName && data.companyName.length > 0),
    {
      message: "Tên công ty là bắt buộc cho nhà tuyển dụng",
      path: ["companyName"],
    },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;

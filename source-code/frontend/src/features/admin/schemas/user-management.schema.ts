/**
 * User Management feature validation schemas using Zod.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEMA LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Zod schemas for form validation
 *   - ✅ Type inference for TypeScript
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

import { z } from "zod";
import type {
  UserStatus,
  UserFilters,
  UserListParams,
} from "../types/user-management.types";

/** Schema for user filters. */
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "EMPLOYER", "STUDENT", ""]).optional(),
  status: z.enum(["ACTIVE", "DISABLED", ""]).optional(),
}) satisfies z.ZodType<UserFilters>;

/** Schema for user list query parameters. */
export const userListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  filters: userFiltersSchema.optional().default({}),
}) satisfies z.ZodType<UserListParams>;

/** Schema for updating user status. */
export const updateUserStatusSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  status: z.enum(["ACTIVE", "DISABLED"]),
}) satisfies z.ZodType<{ userId: string; status: UserStatus }>;

/** Type inference for user filters. */
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;

/** Type inference for user list params. */
export type UserListParamsInput = z.infer<typeof userListParamsSchema>;

/** Type inference for update user status. */
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

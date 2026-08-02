/**
 * User Management feature type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ User types with role and status
 *   - ✅ Pagination and filter types
 *   - ✅ API response types
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

/** User role in the system. */
export type UserRole = "ADMIN" | "EMPLOYER" | "STUDENT";

/** User account status. */
export type UserStatus = "ACTIVE" | "DISABLED";

/** Input for updating user status. */
export interface UpdateUserStatusInput {
  userId: string;
  isActive: boolean;
}

/** User avatar information. */
export interface UserAvatar {
  url: string | null;
  alt: string;
}

/** A user in the system. */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: UserAvatar;
  createdAt: string; // ISO string
}

/** Pagination parameters for user list. */
export interface UserPaginationParams {
  page: number;
  pageSize: number;
}

/** Filter parameters for user list. */
export interface UserFilters {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
}

/** Combined query parameters for user list API. */
export interface UserListParams extends UserPaginationParams {
  filters: UserFilters;
}

/** Paginated response for user list. */
export interface PaginatedUserResponse {
  users: User[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/** Role badge variant for display. */
export type RoleBadgeVariant = "admin" | "employer" | "student";

/** Status badge variant for display. */
export type StatusBadgeVariant = "active" | "disabled";

/** Role badge configuration. */
export interface RoleBadgeConfig {
  label: string;
  variant: RoleBadgeVariant;
  className: string;
}

/** Status badge configuration. */
export interface StatusBadgeConfig {
  label: string;
  variant: StatusBadgeVariant;
  className: string;
  actionLabel: string; // "Disable" or "Enable"
  actionVariant: "danger" | "primary";
}

/** Mapping of role to badge config. */
export const ROLE_BADGE_CONFIG: Record<UserRole, RoleBadgeConfig> = {
  ADMIN: {
    label: "ADMIN",
    variant: "admin",
    className: "bg-primary-light text-primary",
  },
  EMPLOYER: {
    label: "EMPLOYER",
    variant: "employer",
    className: "bg-accent-light text-accent",
  },
  STUDENT: {
    label: "STUDENT",
    variant: "student",
    className: "bg-sage text-ink/60",
  },
};

/** Mapping of status to badge config. */
export const STATUS_BADGE_CONFIG: Record<UserStatus, StatusBadgeConfig> = {
  ACTIVE: {
    label: "Active",
    variant: "active",
    className: "bg-primary-light text-primary",
    actionLabel: "Disable",
    actionVariant: "danger",
  },
  DISABLED: {
    label: "Disabled",
    variant: "disabled",
    className: "bg-sage text-ink/50",
    actionLabel: "Enable",
    actionVariant: "primary",
  },
};

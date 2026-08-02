/**
 * @interface IAdminRepository
 * @description Repository Pattern for Admin Domain - Dashboard & Management Queries
 * @implements Repository Pattern
 * @implements Domain Layer
 * @implements Dependency Inversion
 * @summary Contract for Admin Repository - Read-heavy composite queries for admin dashboard
 */

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  pendingJobs: number;
}

export interface PendingEmployer {
  id: string;
  userId: string;
  companyName: string;
  companyDescription: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
  verified: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
  };
}

export interface PendingJob {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  state: string;
  expiresAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  employer: {
    id: string;
    companyName: string;
    verified: boolean;
    user: {
      id: string;
      email: string;
    };
  };
}

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  studentProfile: {
    id: string;
    fullName: string;
    university: string | null;
    major: string | null;
  } | null;
  employerProfile: {
    id: string;
    companyName: string;
    verified: boolean;
  } | null;
}

export interface UserListFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAdminRepository {
  /**
   * Find a user by ID.
   */
  findUserById(id: string): Promise<UserListItem | null>;

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Promise<DashboardStats>;

  /**
   * Get pending employers awaiting verification
   */
  getPendingEmployers(): Promise<PendingEmployer[]>;

  /**
   * Get pending jobs awaiting approval
   */
  getPendingJobs(): Promise<PendingJob[]>;

  /**
   * Get users with pagination and filtering
   */
  getUsers(
    page: number,
    limit: number,
    filters?: UserListFilters,
  ): Promise<PaginatedResult<UserListItem>>;

  /**
   * Find employer by ID with user details
   */
  findEmployerById(id: string): Promise<PendingEmployer | null>;

  /**
   * Find job by ID with employer details
   */
  findJobById(id: string): Promise<PendingJob | null>;

  /**
   * Update employer verification status
   */
  updateEmployerVerification(id: string, verified: boolean, verifiedBy: string): Promise<void>;

  /**
   * Update job approval status
   */
  updateJobApproval(
    id: string,
    state: string,
    approvedBy: string,
    rejectionReason?: string,
  ): Promise<void>;

  /**
   * Update user active status
   */
  updateUserStatus(id: string, isActive: boolean): Promise<void>;
}

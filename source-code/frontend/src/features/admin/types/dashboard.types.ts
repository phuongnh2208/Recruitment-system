/**
 * Admin Dashboard feature type definitions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TYPES LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Dashboard statistics types
 *   - ✅ Pending employer types
 *   - ✅ Pending job types
 *   - ❌ No business logic
 *   - ❌ No API calls
 */

/** Dashboard statistics summary - matches backend GetDashboardStatsResult. */
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  pendingJobs: number;
  retrievedAt: string;
}

export type { PendingEmployer, PendingJob } from "./pending.types";

/** Full response from the admin dashboard API - flat structure from backend. */
export interface DashboardResponse {
  totalUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  pendingJobs: number;
  retrievedAt: string;
}

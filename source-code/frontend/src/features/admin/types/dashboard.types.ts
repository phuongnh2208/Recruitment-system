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

/** Dashboard statistics summary. */
export interface DashboardStats {
  totalUsers: number;
  students: number;
  employers: number;
  jobs: number;
  applications: number;
}

/** A pending employer awaiting verification. */
export interface PendingEmployer {
  id: string;
  companyName: string;
  email: string;
  website: string;
  registeredAt: string; // ISO string
}

/** A pending job posting awaiting approval. */
export interface PendingJob {
  id: string;
  title: string;
  employerName: string;
  createdAt: string; // ISO string
  state: "Pending";
}

/** Full response from the admin dashboard API. */
export interface DashboardResponse {
  stats: DashboardStats;
  pendingEmployers: PendingEmployer[];
  pendingJobs: PendingJob[];
}

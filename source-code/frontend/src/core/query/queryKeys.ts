/**
 * Centralized Query Keys for TanStack Query
 *
 * ══════════════════════════════════════════════════════════════════
 * QUERY KEY MANAGEMENT
 * ══════════════════════════════════════════════════════════════════
 *
 * All query keys are defined here to ensure consistency and
 * make cache invalidation easier to maintain.
 */

export const queryKeys = {
  // Student CV queries
  student: {
    cv: {
      all: ["student", "cv"] as const,
      list: ["student", "cv", "list"] as const,
    },
    profile: ["student", "profile"] as const,
    applicationHistory: {
      all: ["student", "application-history"] as const,
      list: (page: number, size: number) =>
        ["student", "application-history", "list", page, size] as const,
    },
    application: {
      all: ["student", "application"] as const,
      apply: ["student", "application", "apply"] as const,
    },
  },
  // Employer applicants queries
  employer: {
    applicants: {
      all: ["employer", "applicants"] as const,
      list: (page: number, size: number, search?: string, status?: string) =>
        ["employer", "applicants", "list", page, size, search, status] as const,
    },
    applicantDetail: {
      all: ["employer", "applicant-detail"] as const,
      detail: (applicationId: string) =>
        ["employer", "applicant-detail", applicationId] as const,
    },
  },
  // Job queries
  job: {
    all: ["job"] as const,
    search: {
      all: ["job", "search"] as const,
      list: (
        page: number,
        size: number,
        search?: string,
        location?: string,
        salaryMin?: number,
        salaryMax?: number,
      ) =>
        [
          "job",
          "search",
          "list",
          page,
          size,
          search,
          location,
          salaryMin,
          salaryMax,
        ] as const,
    },
    detail: {
      all: ["job", "detail"] as const,
      detail: (jobId: string) => ["job", "detail", jobId] as const,
    },
  },
  // Employer job dashboard queries
  employerJob: {
    all: ["employer", "job"] as const,
    list: (page: number, size: number, search?: string, state?: string) =>
      ["employer", "job", "list", page, size, search, state] as const,
  },
  // Admin queries
  admin: {
    dashboard: {
      all: ["admin", "dashboard"] as const,
      detail: ["admin", "dashboard", "detail"] as const,
    },
    pendingApprovals: {
      all: ["admin", "pending-approvals"] as const,
      detail: ["admin", "pending-approvals", "detail"] as const,
    },
    users: {
      all: ["admin", "users"] as const,
      list: (
        page: number,
        pageSize: number,
        search?: string,
        role?: string,
        status?: string,
      ) =>
        [
          "admin",
          "users",
          "list",
          page,
          pageSize,
          search,
          role,
          status,
        ] as const,
    },
  },
} as const;

export type QueryKeys = typeof queryKeys;

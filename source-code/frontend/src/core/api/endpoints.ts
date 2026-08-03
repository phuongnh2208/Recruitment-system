/**
 * API endpoint constants.
 * All endpoint URLs are centralized here - no hardcoded URLs in components.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
  },
  STUDENT: {
    PROFILE: "/student/profile",
    CV_UPLOAD: "/student/cv/upload",
    CV_LIST: "/student/cv",
    CV_DELETE: (cvId: string) => `/student/cv/${cvId}`,
    CV_SET_DEFAULT: (cvId: string) => `/student/cv/${cvId}/default`,
    APPLICATIONS: "/student/applications",
    JOB_DETAIL: (jobId: string) => `/student/jobs/${jobId}`,
    JOBS: "/student/jobs",
  },
  EMPLOYER: {
    COMPANY_PROFILE: "/employer/company-profile",
    APPLICANTS: "/employer/applicants",
    APPLICANT_DETAIL: (applicationId: string) =>
      `/employer/applicants/${applicationId}`,
  },
  JOB: {
    CREATE: "/jobs",
    UPDATE: (jobId: string) => `/jobs/${jobId}`,
    SEARCH: "/jobs",
    DETAIL: (jobId: string) => `/jobs/${jobId}`,
  },
  EMPLOYER_JOB: {
    LIST: "/jobs",
    SUBMIT: (jobId: string) => `/jobs/${jobId}/submit`,
    CLOSE: (jobId: string) => `/jobs/${jobId}/close`,
  },
  APPLICATION: {
    APPLY: "/applications",
    UPDATE_STATUS: (applicationId: string) =>
      `/applications/${applicationId}/status`,
    WITHDRAW: (applicationId: string) =>
      `/applications/${applicationId}/withdraw`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    PENDING_APPROVALS: "/admin/pending-approvals",
    VERIFY_EMPLOYER: (employerId: string) =>
      `/admin/employers/${employerId}/verify`,
    APPROVE_JOB: (jobId: string) => `/admin/jobs/${jobId}/approve`,
    REJECT_JOB: (jobId: string) => `/admin/jobs/${jobId}/reject`,
    USERS: "/admin/users",
    UPDATE_USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
    AUDIT_LOGS: "/admin/audit-logs",
  },
} as const;

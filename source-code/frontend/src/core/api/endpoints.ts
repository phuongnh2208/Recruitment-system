/**
 * API endpoint constants.
 * All endpoint URLs are centralized here — no hardcoded URLs in components.
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
  },
} as const;

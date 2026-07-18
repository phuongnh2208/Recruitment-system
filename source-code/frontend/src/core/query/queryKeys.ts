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
    applicationHistory: {
      all: ["student", "application-history"] as const,
      list: (page: number, size: number) =>
        ["student", "application-history", "list", page, size] as const,
    },
  },
} as const;

export type QueryKeys = typeof queryKeys;

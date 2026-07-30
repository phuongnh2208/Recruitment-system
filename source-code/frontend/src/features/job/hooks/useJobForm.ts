/**
 * Custom hook for the Job Posting form.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This hook encapsulates all form-related state and logic:
 *   - Form initialisation with React Hook Form + Zod resolver
 *   - Mutation handling via the service layer
 *   - Loading / success / error state management
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS LOGIC BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Form state management
 *   - ✅ Mutation orchestration
 *   - ❌ Direct API calls (delegates to job.service)
 *   - ❌ Business rules
 */
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, type JobFormValues } from "../schemas/job.schema";
import { createJobPosting, updateJobPosting } from "../services/job.service";

/** Default expiration date: 30 days from now in ISO format. */
const DEFAULT_EXPIRES_AT = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

/** Mode for the job form: create or edit. */
export type JobFormMode = "create" | "edit";

/** Return type for the useJobForm hook. */
export interface UseJobFormReturn {
  /** React Hook Form instance methods. */
  form: ReturnType<typeof useForm<JobFormValues>>;
  /** Submit the form. */
  onSubmit: (values: JobFormValues) => Promise<void>;
  /** Whether a submission is in progress. */
  isSubmitting: boolean;
  /** Whether the last submission succeeded. */
  isSuccess: boolean;
  /** Error message from the last failed submission, or null. */
  error: string | null;
  /** Reset success / error states. */
  resetStatus: () => void;
}

/**
 * Provides form state, validation, and submission logic for the
 * Job Posting form (create/edit).
 *
 * @param mode - "create" for new job posting, "edit" for updating existing.
 * @param jobId - Required when mode is "edit", the job posting ID to update.
 * @param defaultValues - Optional initial values to populate the form.
 * @returns Form control and submission helpers.
 */
export function useJobForm(
  mode: JobFormMode,
  jobId?: string,
  defaultValues?: Partial<JobFormValues>,
): UseJobFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JobFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      salaryMin: undefined,
      salaryMax: undefined,
      expiresAt: DEFAULT_EXPIRES_AT,
      ...defaultValues,
    } as JobFormValues,
  });

  const resetStatus = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (values: JobFormValues) => {
      setIsSubmitting(true);
      setIsSuccess(false);
      setError(null);

      try {
        if (mode === "create") {
          await createJobPosting(values);
        } else if (mode === "edit" && jobId) {
          await updateJobPosting({
            jobPostingId: jobId,
            ...values,
          });
        }
        setIsSuccess(true);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : mode === "create"
              ? "Tạo tin tuyển dụng thất bại. Vui lòng thử lại."
              : "Cập nhật tin tuyển dụng thất bại. Vui lòng thử lại.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, jobId],
  );

  return {
    form,
    onSubmit,
    isSubmitting,
    isSuccess,
    error,
    resetStatus,
  };
}

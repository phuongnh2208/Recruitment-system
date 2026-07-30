/**
 * Custom hook for the Employer Company Profile form.
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
 *   - ❌ Direct API calls (delegates to employer.service)
 *   - ❌ Business rules
 */
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyProfileSchema,
  type CompanyProfileFormValues,
} from "../schemas/company-profile.schema";
import { updateCompanyProfile } from "../services/employer.service";

/** Return type for the useCompanyProfileForm hook. */
export interface UseCompanyProfileFormReturn {
  /** React Hook Form instance methods. */
  form: ReturnType<typeof useForm<CompanyProfileFormValues>>;
  /** Submit the form. */
  onSubmit: (values: CompanyProfileFormValues) => Promise<void>;
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
 * Employer Company Profile page.
 *
 * @param defaultValues - Optional initial values to populate the form.
 * @returns Form control and submission helpers.
 */
export function useCompanyProfileForm(
  defaultValues?: Partial<CompanyProfileFormValues>,
): UseCompanyProfileFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "",
      description: "",
      website: "",
      logoUrl: "",
      ...defaultValues,
    },
  });

  const resetStatus = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (values: CompanyProfileFormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      await updateCompanyProfile(values);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Cập nhật hồ sơ công ty thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    form,
    onSubmit,
    isSubmitting,
    isSuccess,
    error,
    resetStatus,
  };
}

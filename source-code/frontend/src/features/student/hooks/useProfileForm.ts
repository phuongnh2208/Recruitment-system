/**
 * Custom hook for the Student Profile form.
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
 *   - ❌ Direct API calls (delegates to student.service)
 *   - ❌ Business rules
 */
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schema";
import { updateProfile } from "../services/student.service";

/** Return type for the useProfileForm hook. */
export interface UseProfileFormReturn {
  /** React Hook Form instance methods. */
  form: ReturnType<typeof useForm<ProfileFormValues>>;
  /** Submit the form. */
  onSubmit: (values: ProfileFormValues) => Promise<void>;
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
 * Student Profile page.
 *
 * @param defaultValues - Optional initial values to populate the form.
 * @returns Form control and submission helpers.
 */
export function useProfileForm(
  defaultValues?: Partial<ProfileFormValues>,
): UseProfileFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      school: "",
      major: "",
      graduationYear: "",
      ...defaultValues,
    },
  });

  const resetStatus = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      await updateProfile(values);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Cập nhật hồ sơ thất bại. Vui lòng thử lại.";
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

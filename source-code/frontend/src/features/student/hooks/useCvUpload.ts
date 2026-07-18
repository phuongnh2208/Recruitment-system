/**
 * Custom hook for CV file upload with progress tracking.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOK LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ File selection and validation via Zod
 *   - ✅ Upload mutation with progress tracking
 *   - ✅ Loading / success / error state management
 *   - ❌ Direct API calls (delegates to student.service)
 *   - ❌ Business rules
 */
import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCv } from "../services/student.service";
import { cvFileSchema } from "../schemas/cv.schema";
import { ZodError } from "zod";
import { queryKeys } from "../../../core/query/queryKeys";

/** Return type for the useCvUpload hook. */
export interface UseCvUploadReturn {
  /** Upload progress percentage (0–100), or null when idle. */
  uploadProgress: number | null;
  /** Validation error message from file selection, or null. */
  validationError: string | null;
  /** Whether an upload is in progress. */
  isUploading: boolean;
  /** Whether the last upload succeeded. */
  isUploadSuccess: boolean;
  /** Error message from the last failed upload, or null. */
  uploadError: string | null;
  /** Select and validate a file, then trigger upload. */
  handleFileSelect: (file: File) => void;
  /** Reset all status fields. */
  resetStatus: () => void;
}

/**
 * Handles file selection, validation, and upload for student CVs.
 *
 * @returns Upload state and handler functions.
 */
export function useCvUpload(): UseCvUploadReturn {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress(0);
      await uploadCv(file, (percent: number) => {
        setUploadProgress(percent);
      });
    },
    onSuccess: () => {
      setUploadProgress(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.student.cv.all });
    },
    onError: () => {
      setUploadProgress(null);
    },
  });

  const handleFileSelect = useCallback(
    (file: File) => {
      setValidationError(null);

      const result = cvFileSchema.safeParse(file);
      if (!result.success) {
        const zodError = result.error;
        const firstMessage =
          zodError instanceof ZodError
            ? (zodError.issues[0]?.message ?? "Tệp không hợp lệ.")
            : "Tệp không hợp lệ.";
        setValidationError(firstMessage);
        return;
      }

      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const resetStatus = useCallback(() => {
    setValidationError(null);
    setUploadProgress(null);
    uploadMutation.reset();
  }, [uploadMutation]);

  return {
    uploadProgress,
    validationError,
    isUploading: uploadMutation.isPending,
    isUploadSuccess: uploadMutation.isSuccess,
    uploadError: uploadMutation.isError
      ? uploadMutation.error instanceof Error
        ? uploadMutation.error.message
        : "Tải lên thất bại. Vui lòng thử lại."
      : null,
    handleFileSelect,
    resetStatus,
  };
}

/**
 * Apply Job Dialog component for submitting job applications.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Modal dialog with CV selector and cover letter
 *   - ✅ Form validation with React Hook Form + Zod
 *   - ✅ Loading, success, and error states
 *   - ✅ ESC key to close
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns
 */

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCvList } from "../../student/hooks/useCvList";
import { useApplyJob } from "../hooks/useApplyJob";
import {
  applyJobSchema,
  type ApplyJobFormData,
} from "../schemas/application.schema";
import type { ApplyJobResponse } from "../types/application.types";
import CvSelector from "./CvSelector";
import ApplySuccess from "./ApplySuccess";

/** Props for the ApplyJobDialog component. */
export interface ApplyJobDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Job ID to apply for. */
  jobId: string;
  /** Callback when the dialog is closed. */
  onClose: () => void;
}

/**
 * ApplyJobDialog component for submitting job applications.
 *
 * @param props - Component props.
 * @returns The rendered dialog or null if closed.
 */
export default function ApplyJobDialog({
  isOpen,
  jobId,
  onClose,
}: ApplyJobDialogProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState<
    ApplyJobResponse["data"] | null
  >(null);

  // Fetch CV list
  const { data: cvs = [], isLoading: isLoadingCvs } = useCvList();

  // Apply job mutation
  const {
    apply,
    isLoading: isApplying,
    error,
  } = useApplyJob({
    jobId,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      console.error("Failed to apply for job:", error);
    },
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ApplyJobFormData>({
    resolver: zodResolver(applyJobSchema),
    mode: "onChange",
    defaultValues: {
      cvId: "",
      coverLetter: "",
    },
  });

  const selectedCvId = watch("cvId");

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isApplying) {
        onClose();
      }
    },
    [isOpen, isApplying, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setApplicationData(null);
      setValue("cvId", "");
      setValue("coverLetter", "");
    }
  }, [isOpen, setValue]);

  // Handle form submission
  const onSubmit = async (data: ApplyJobFormData) => {
    await apply(data.cvId, data.coverLetter);
  };

  // Handle close
  const handleClose = () => {
    if (!isApplying) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Success state
  if (isSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-success-title"
      >
        <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <ApplySuccess application={applicationData!} onClose={handleClose} />
        </div>
      </div>
    );
  }

  // Loading state for CVs
  if (isLoadingCvs) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-dialog-title"
      >
        <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-ink/5">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="mt-4 text-center font-body text-sm text-ink/60">
            Đang tải danh sách CV...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-dialog-title"
    >
      <div
        className="w-full max-w-lg rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog header */}
        <div className="mb-6">
          <h2
            id="apply-dialog-title"
            className="font-display font-semibold text-2xl text-ink"
          >
            Ứng tuyển công việc
          </h2>
          <p className="mt-1 font-body text-sm text-ink/60">
            Chọn CV và thêm thư xin việc (nếu có) để ứng tuyển.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 rounded-lg bg-danger-light p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-danger shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="font-body text-sm font-medium text-danger">
                  Ứng tuyển thất bại
                </p>
                <p className="mt-1 font-body text-sm text-danger">
                  {error.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            {/* CV Selector */}
            <CvSelector
              cvs={cvs}
              selectedCvId={selectedCvId}
              onSelect={(cvId) => setValue("cvId", cvId)}
              disabled={isApplying}
            />

            {/* CV validation error */}
            {errors.cvId && (
              <p className="font-body text-xs text-danger" role="alert">
                {errors.cvId.message}
              </p>
            )}

            {/* Cover Letter */}
            <div>
              <label htmlFor="coverLetter" className="block">
                <span className="font-body text-sm font-medium text-ink">
                  Thư xin việc
                </span>
                <span className="ml-1 font-body text-sm text-ink/50">
                  (Tùy chọn)
                </span>
              </label>
              <textarea
                id="coverLetter"
                rows={6}
                {...register("coverLetter")}
                disabled={isApplying}
                placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-invalid={errors.coverLetter ? "true" : "false"}
                aria-describedby={
                  errors.coverLetter ? "coverLetter-error" : undefined
                }
              />
              {errors.coverLetter && (
                <p
                  id="coverLetter-error"
                  className="mt-1 font-body text-xs text-danger"
                  role="alert"
                >
                  {errors.coverLetter.message}
                </p>
              )}
              <p className="mt-1 text-right font-body text-xs text-ink/50">
                Tối đa 2000 ký tự
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isApplying}
              className="flex-1 rounded-seal border border-ink/20 px-6 py-2.5 font-body font-medium text-ink transition hover:bg-sage/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || isApplying}
              className="flex-1 rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang gửi...
                </span>
              ) : (
                "Gửi ứng tuyển"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

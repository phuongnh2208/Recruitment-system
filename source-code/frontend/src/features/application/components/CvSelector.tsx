/**
 * CV Selector component for job application dialog.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays list of student's CVs
 *   - ✅ Allows selection of a CV
 *   - ✅ Shows empty state when no CVs available
 *   - ✅ Follows design.md patterns (rounded-card, shadow-card, etc.)
 */

import type { CVMetadata } from "../../student/types/cv.types";

/** Props for the CvSelector component. */
export interface CvSelectorProps {
  /** List of available CVs. */
  cvs: CVMetadata[];
  /** Currently selected CV ID. */
  selectedCvId?: string;
  /** Callback when a CV is selected. */
  onSelect: (cvId: string) => void;
  /** Whether the selector is disabled. */
  disabled?: boolean;
}

/**
 * CvSelector component for selecting a CV in the job application dialog.
 *
 * @param props - Component props.
 * @returns The rendered CV selector.
 */
export default function CvSelector({
  cvs,
  selectedCvId,
  onSelect,
  disabled = false,
}: CvSelectorProps) {
  // Empty state
  if (cvs.length === 0) {
    return (
      <div className="rounded-card bg-sage/30 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-ink/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-3 font-body text-sm text-ink/60">
          Bạn chưa có CV nào. Vui lòng upload CV trước khi ứng tuyển.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="font-body text-sm font-medium text-ink">
          Chọn CV <span className="text-danger">*</span>
        </span>
      </label>
      <div className="space-y-2">
        {cvs.map((cv) => {
          const isSelected = selectedCvId === cv.id;

          return (
            <button
              key={cv.id}
              type="button"
              onClick={() => onSelect(cv.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`
                w-full rounded-lg border-2 p-4 text-left transition
                ${
                  isSelected
                    ? "border-primary bg-primary-light"
                    : "border-ink/10 bg-white hover:border-primary/30"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                focus:outline-none focus:ring-2 focus:ring-primary/20
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-ink/40 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-body text-sm font-medium text-ink">
                      {cv.fileName}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 ml-7">
                    <span className="font-mono text-xs text-ink/50">
                      {(cv.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="font-mono text-xs text-ink/50">
                      {new Date(cv.uploadedAt).toLocaleDateString("vi-VN")}
                    </span>
                    {cv.isDefault && (
                      <span className="rounded-seal bg-primary-light px-2 py-0.5 font-mono text-xs text-primary">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <svg
                    className="h-5 w-5 text-primary shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

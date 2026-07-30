/**
 * Error state component for the applicant detail page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows an error message with a retry button
 *   - ✅ Follows design.md error pattern
 *   - ❌ No business logic
 */

export interface ErrorStateProps {
  /** Error message to display. */
  message?: string;
  /** Callback when the user clicks retry. */
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div
          className="rounded-lg border border-danger/20 bg-danger-light px-4 py-6"
          role="alert"
        >
          <div className="flex flex-col items-center text-center">
            <svg
              className="h-10 w-10 text-danger/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="mt-3 font-body text-base font-medium text-danger">
              {message ?? "Không thể tải thông tin ứng viên."}
            </p>
            <p className="mt-1 font-body text-sm text-danger/70">
              Vui lòng thử lại sau.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 rounded-seal border border-danger px-5 py-2 font-body text-sm font-medium text-danger transition hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-danger/20"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

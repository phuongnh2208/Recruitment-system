/**
 * Job Detail Error State – displays error message with retry button.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows error message
 *   - ✅ Provides retry button
 *   - ✅ Follows design.md error state patterns
 */

export interface JobDetailErrorStateProps {
  /** Error message to display. */
  message?: string;
  /** Callback when retry button is clicked. */
  onRetry: () => void;
}

export default function JobDetailErrorState({
  message = "Không thể tải chi tiết công việc.",
  onRetry,
}: JobDetailErrorStateProps) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div
          className="rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
          role="alert"
        >
          <p className="font-body text-sm font-medium text-danger">{message}</p>
          <button
            onClick={onRetry}
            className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}

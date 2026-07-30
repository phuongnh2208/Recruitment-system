/**
 * Job Apply Card – sidebar with company info, apply button, and save button.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows company information
 *   - ✅ Apply button (primary action)
 *   - ✅ Save button (UI only, as per requirements)
 *   - ✅ Follows design.md button and card patterns
 */

export interface JobApplyCardProps {
  /** Company name. */
  companyName: string;
  /** Company description (optional). */
  companyDescription?: string;
  /** Company website (optional). */
  website?: string;
  /** Company address (optional). */
  companyAddress?: string;
  /** Whether the employer is verified. */
  employerVerified: boolean;
  /** Callback when apply button is clicked. */
  onApply?: () => void;
  /** Callback when save button is clicked. */
  onSave?: () => void;
}

export default function JobApplyCard({
  companyName,
  companyDescription,
  website,
  companyAddress,
  employerVerified,
  onApply,
  onSave,
}: JobApplyCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      {/* Company info */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-lg text-ink">
            {companyName}
          </h3>
          {employerVerified && (
            <span
              className="inline-flex items-center gap-1 rounded-seal bg-accent-light px-2 py-0.5 font-mono text-xs font-medium text-accent ring-1 ring-accent/30"
              aria-label="Đã xác thực"
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path
                  d="M8 12.5l2.5 2.5L16 9.5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Đã xác thực
            </span>
          )}
        </div>

        {companyDescription && (
          <p className="mt-2 font-body text-sm text-ink/60 line-clamp-3">
            {companyDescription}
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          {companyAddress && (
            <div className="flex items-start gap-2">
              <svg
                className="h-4 w-4 text-ink/40 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="font-body text-sm text-ink/60">
                {companyAddress}
              </span>
            </div>
          )}

          {website && (
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-ink/40 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-primary hover:text-primary-dark transition"
              >
                {website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Ứng tuyển ngay
        </button>
        <button
          type="button"
          onClick={onSave}
          className="w-full rounded-seal border border-primary px-6 py-2.5 font-body font-medium text-primary transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Lưu công việc
        </button>
      </div>
    </div>
  );
}
